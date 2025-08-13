import {
  generateCallSummaryOptimized,
  wasLastSummaryUsingFallback,
} from "@server/openai";
import { DatabaseStorage } from "@server/storage";
import { logger } from "@shared/utils/logger";
import express from "express";

const router = express.Router();
const storage = new DatabaseStorage();

/**
 * ✅ HELPER: Extract tenant ID from request
 */
function extractTenantFromRequest(req: any): string {
  try {
    const hostname = req.get("host") || "";
    const subdomain = hostname.split(".")[0];

    if (subdomain && subdomain !== "localhost" && subdomain !== "www") {
      return subdomain;
    }

    return "mi-nhon-hotel"; // Safe fallback
  } catch (error) {
    logger.warn(
      "⚠️ [Webhook] Failed to extract tenant from request, using fallback",
      "Component",
      error,
    );
    return "mi-nhon-hotel";
  }
}

/**
 * ✅ HELPER: Process transcript with OpenAI for summary generation
 */
async function processTranscriptWithOpenAI(
  transcript: any[],
  callId: string,
  req: any,
) {
  try {
    logger.debug("[Webhook] Processing transcript with OpenAI", "Component", {
      transcriptLength: transcript.length,
      callId,
    });

    // Detect language from transcript
    const detectLanguage = (transcript: any[]): string => {
      const allText = transcript
        .map((t) => t.content || t.message)
        .join(" ")
        .toLowerCase();
      if (allText.includes("xin chào") || allText.includes("cảm ơn"))
        return "vi";
      if (allText.includes("bonjour") || allText.includes("merci")) return "fr";
      if (allText.includes("привет") || allText.includes("спасибо"))
        return "ru";
      if (allText.includes("안녕하세요") || allText.includes("감사합니다"))
        return "ko";
      if (allText.includes("你好") || allText.includes("谢谢")) return "zh";
      return "en"; // Default to English
    };

    const language = detectLanguage(transcript);
    logger.debug(`[Webhook] Detected language: ${language}`, "Component");

    // ✅ COST OPTIMIZATION: Generate summary AND extract service requests in ONE call
    const { summary, serviceRequests } = await generateCallSummaryOptimized(
      transcript,
      language,
    );

    logger.success("[Webhook] OpenAI processing completed", "Component", {
      summaryLength: summary?.length || 0,
      serviceRequestsCount: serviceRequests?.length || 0,
      callId,
    });

    // Save summary to database (with audit trail for source)
    try {
      // Extract room number from summary
      const roomNumberMatch = summary.match(
        /(?:room(?:\s+number)?|room|phòng)(?:\s*[:#-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/,
      );
      const extractedRoomNumber = roomNumberMatch
        ? roomNumberMatch[1] || roomNumberMatch[2]
        : null;

      // Annotate summary with source for audit (without changing routes/schema)
      const sourceLabel = "OpenAI"; // This block is only reached when OpenAI succeeded
      const annotatedSummary = `Source: ${sourceLabel}\n\n${summary}`;

      await storage.addCallSummary({
        call_id: callId,
        content: annotatedSummary,
        room_number: extractedRoomNumber,
        duration: null, // Will be updated by end-of-call-report
      });

      logger.success(
        "[Webhook] OpenAI summary saved to database",
        "Component",
        {
          callId,
          summaryLength: annotatedSummary?.length || 0,
          roomNumber: extractedRoomNumber,
        },
      );
    } catch (dbError) {
      logger.error(
        "[Webhook] Failed to save summary to database:",
        "Component",
        dbError,
      );
    }

    // ✅ NEW: Save service requests to database
    if (serviceRequests && serviceRequests.length > 0) {
      try {
        // Extract tenant ID from request
        const tenantId = extractTenantFromRequest(req);

        logger.debug(
          "[Webhook] Saving service requests to database",
          "Component",
          {
            callId,
            serviceRequestsCount: serviceRequests.length,
            tenantId,
          },
        );

        // Save each service request
        const savedRequests: any[] = [];
        for (const serviceRequest of serviceRequests) {
          const savedRequest = await storage.addServiceRequest(
            serviceRequest,
            callId,
            tenantId,
            summary,
          );
          savedRequests.push(savedRequest);
        }

        logger.success(
          "[Webhook] Service requests saved to database successfully",
          "Component",
          {
            callId,
            savedCount: savedRequests.length,
            requestIds: savedRequests.map((r) => r.id),
          },
        );

        // ✅ EMIT WEBSOCKET FOR NEW REQUESTS
        const io = (req as any).app?.get("io");
        if (io) {
          // Emit for each new request
          savedRequests.forEach((request) => {
            io.emit("requestStatusUpdate", {
              type: "new-request",
              requestId: request.id,
              status: request.status,
              roomNumber: request.room_number,
              guestName: request.guest_name,
              requestContent: request.request_content,
              orderType: request.order_type,
              timestamp: new Date().toISOString(),
            });

            logger.debug(
              `📡 [Webhook] WebSocket emitted for new request ${request.id}`,
              "Component",
            );
          });
        }

        // ✅ ENHANCEMENT: Also use Dashboard WebSocket service for dashboard updates
        try {
          const { dashboardWebSocket } = await import(
            "@server/services/DashboardWebSocket"
          );
          savedRequests.forEach((request) => {
            dashboardWebSocket.publishDashboardUpdate({
              type: "request_update",
              tenantId: "mi-nhon-hotel",
              data: {
                requestId: request.id,
                status: request.status,
                roomNumber: request.room_number,
                guestName: request.guest_name,
                requestContent: request.request_content,
                orderType: request.order_type,
                timestamp: new Date().toISOString(),
              },
              timestamp: new Date().toISOString(),
              source: "webhook_new_request",
            });

            logger.debug(
              `📊 [Webhook] Dashboard WebSocket update sent for request ${request.id}`,
              "Component",
            );
          });
        } catch (dashboardError) {
          logger.warn(
            "⚠️ [Webhook] Dashboard WebSocket update failed, using fallback",
            "Component",
            dashboardError,
          );
          // ✅ ENHANCEMENT: Continue without WebSocket - dashboard will use polling
          logger.info(
            "🔄 [Webhook] Dashboard will use polling fallback for updates",
            "Component",
          );
        }
      } catch (serviceError) {
        logger.error(
          "[Webhook] Failed to save service requests to database:",
          "Component",
          serviceError,
        );
      }
    }

    // Send WebSocket notification
    try {
      // ✅ FIX: Get io from req.app instead of require
      const io = (req as any).app.get("io");
      if (io) {
        // Send progression updates
        io.emit("summary-progression", {
          type: "summary-progression",
          callId: callId,
          status: "processing",
          progress: 25,
          currentStep: "Processing transcript with OpenAI",
          currentStepIndex: 0,
          timestamp: new Date().toISOString(),
        });

        // Send final summary with progression hint
        io.emit("call-summary-received", {
          type: "call-summary-received",
          callId: callId,
          summary,
          serviceRequests,
          timestamp: new Date().toISOString(),
        });

        // Notify staff if OpenAI failed and we used fallback
        if (wasLastSummaryUsingFallback()) {
          io.emit("message", {
            type: "error",
            scope: "staff",
            code: "OPENAI_SUMMARY_FALLBACK",
            callId,
            message:
              "OpenAI summary generation failed. A basic fallback summary was used. Please review and assist the guest.",
            timestamp: new Date().toISOString(),
          });

          // Inform guest as well via guestNotification channel used on client UI
          io.emit("guestNotification", {
            title: "Xin lỗi, hệ thống tóm tắt gặp lỗi",
            message:
              "Hiện tại chưa thể hiển thị tóm tắt cuộc gọi. Nhân viên đã được thông báo để hỗ trợ bạn.",
            severity: "warning",
            callId,
            timestamp: new Date().toISOString(),
          });
        }

        logger.success(
          "[Webhook] WebSocket notification sent successfully",
          "Component",
          {
            callId,
            summaryLength: summary?.length || 0,
            serviceRequestsCount: serviceRequests?.length || 0,
          },
        );
      } else {
        logger.warn(
          "[Webhook] WebSocket io instance not available",
          "Component",
        );
      }
    } catch (wsError) {
      logger.error(
        "[Webhook] Failed to send WebSocket notification:",
        "Component",
        wsError,
      );
    }
  } catch (error) {
    logger.error("[Webhook] OpenAI processing failed:", "Component", error);
    throw error;
  }
}

/**
 * ✅ HELPER: Process end-of-call-report for metadata storage
 */
async function processEndOfCallReport(
  endOfCallReport: any,
  callId: string,
  req: any,
) {
  try {
    logger.debug("[Webhook] Processing end-of-call-report", "Component", {
      callId,
    });

    // ✅ ENHANCED: Save detailed call information to call table
    const callData = {
      call_id_vapi: callId,
      tenant_id: extractTenantFromRequest(req),
      room_number: endOfCallReport.call?.customer?.number || null,
      language: null, // Will be detected from transcript
      service_type: "voice_assistant",
      start_time: endOfCallReport.call?.startedAt
        ? new Date(endOfCallReport.call.startedAt)
        : null,
      end_time: endOfCallReport.call?.endedAt
        ? new Date(endOfCallReport.call.endedAt)
        : null,
      duration:
        endOfCallReport.call?.endedAt && endOfCallReport.call?.startedAt
          ? Math.floor(
              (new Date(endOfCallReport.call.endedAt).getTime() -
                new Date(endOfCallReport.call.startedAt).getTime()) /
                1000,
            )
          : null,
    };

    try {
      // ✅ MIGRATED: Use Prisma instead of Drizzle
      const { PrismaClient } = await import("../../../generated/prisma");
      const prisma = new PrismaClient();

      // Insert call record using Prisma
      await prisma.call.create({
        data: callData,
      });

      logger.success(
        "[Webhook] Call information saved to call table",
        "Component",
        { callId, duration: callData.duration },
      );
    } catch (callError) {
      logger.warn(
        "[Webhook] Failed to save call information, using fallback",
        "Component",
        callError,
      );
    }

    // Save end-of-call-report for stakeholders (existing functionality)
    const durationSeconds =
      endOfCallReport.call?.endedAt && endOfCallReport.call?.startedAt
        ? Math.floor(
            (new Date(endOfCallReport.call.endedAt).getTime() -
              new Date(endOfCallReport.call.startedAt).getTime()) /
              1000,
          )
        : null;

    // Store raw end-of-call-report with audit source tag
    const eocrContent = `Source: EndOfCallReport\n\n${JSON.stringify(endOfCallReport)}`;
    await storage.addCallSummary({
      call_id: callId,
      content: eocrContent,
      room_number: endOfCallReport.call?.customer?.number || null,
      duration: durationSeconds ? String(durationSeconds) : null,
    });

    logger.success(
      "[Webhook] End-of-call-report saved for stakeholders",
      "Component",
      { callId },
    );

    // ✅ NEW: Also sync duration into the latest OpenAI summary for this call if missing
    try {
      if (durationSeconds !== null) {
        const { PrismaClient } = await import("../../../generated/prisma");
        const prisma = new PrismaClient();
        await prisma.call_summaries.updateMany({
          where: {
            call_id: callId,
            OR: [{ duration: null }, { duration: undefined as any }],
          },
          data: { duration: String(durationSeconds) },
        });
        logger.debug(
          "[Webhook] Synced duration into call_summaries",
          "Component",
          { callId, durationSeconds },
        );
      }
    } catch (syncError) {
      logger.warn(
        "[Webhook] Failed to sync duration into call_summaries",
        "Component",
        syncError,
      );
    }
  } catch (error) {
    logger.error(
      "[Webhook] Failed to save end-of-call-report:",
      "Component",
      error,
    );
    throw error;
  }
}

/**
 * ✅ FIXED: Webhook endpoint để nhận dữ liệu từ Vapi.ai
 * Handles both 'transcript' and 'end-of-call-report' events separately
 * POST /api/webhook/vapi
 */
router.post("/vapi", express.json(), async (req, res) => {
  try {
    // ✅ FIX: Parse Vapi.ai payload structure correctly
    const message = req.body.message || req.body;

    // ✅ MEMORY FIX: Check payload size before processing
    const transcriptData = message?.transcript || message?.messages || [];
    const transcriptLength = Array.isArray(transcriptData)
      ? transcriptData.length
      : 0;
    const payloadSize = JSON.stringify(req.body).length;

    // Reject if payload or transcript is too large
    if (payloadSize > 1024 * 1024) {
      // 1MB limit
      logger.warn("[Webhook] Payload too large", "Component", {
        payloadSizeMB: (payloadSize / 1024 / 1024).toFixed(2),
        limit: "1MB",
      });
      return res.status(413).json({
        success: false,
        error: "Payload too large",
      });
    }

    if (transcriptLength > 10000) {
      // Max 10k transcript entries
      logger.warn("[Webhook] Transcript too long", "Component", {
        transcriptLength,
        limit: 10000,
      });
      return res.status(413).json({
        success: false,
        error: "Transcript too long",
      });
    }

    logger.debug("[Webhook] Received data from Vapi.ai:", "Component", {
      messageType: message?.type,
      hasCall: !!message?.call,
      hasTranscript: !!message?.transcript,
      hasMessages: !!message?.messages,
      transcriptLength,
      payloadSizeKB: (payloadSize / 1024).toFixed(1),
      payloadKeys: Object.keys(message || {}),
    });

    // ✅ FIX: Handle both transcript and end-of-call-report events separately
    const isTranscriptEvent = message?.type === "transcript";
    const isEndOfCallEvent = message?.type === "end-of-call-report";

    const callId = message?.call?.id || `call-${Date.now()}`;

    // ✅ HANDLE REALTIME TRANSCRIPT EVENT (no OpenAI processing)
    if (isTranscriptEvent) {
      logger.debug(
        "[Webhook] Received realtime transcript event",
        "Component",
        {
          callId,
          transcriptLength:
            message?.transcript?.length || message?.messages?.length || 0,
        },
      );

      // ✅ REALTIME TRANSCRIPT: Only log, do NOT process with OpenAI
      // This is partial, incomplete data sent during the call
      // We'll wait for the final transcript in end-of-call-report

      return res.status(200).json({
        success: true,
        message: "Realtime transcript received (not processed)",
        callId,
      });
    }

    // ✅ HANDLE END-OF-CALL-REPORT EVENT (with final transcript for OpenAI)
    if (isEndOfCallEvent) {
      logger.debug(
        "[Webhook] Processing end-of-call-report with final transcript",
        "Component",
        {
          callId,
          hasMessages: !!message?.messages,
          messagesLength: message?.messages?.length || 0,
        },
      );

      // ✅ STEP 1: Save end-of-call-report metadata
      await processEndOfCallReport(message, callId, req);

      // ✅ STEP 2: Extract FINAL TRANSCRIPT for OpenAI processing
      const finalTranscript = message?.messages || [];
      if (
        finalTranscript &&
        Array.isArray(finalTranscript) &&
        finalTranscript.length > 0
      ) {
        logger.debug(
          "[Webhook] Processing FINAL TRANSCRIPT with OpenAI",
          "Component",
          {
            callId,
            transcriptLength: finalTranscript.length,
          },
        );

        // Process final transcript with OpenAI to generate summary
        await processTranscriptWithOpenAI(finalTranscript, callId, req);
      } else {
        logger.warn(
          "[Webhook] No final transcript found in end-of-call-report",
          "Component",
          { callId },
        );
      }

      return res.status(200).json({
        success: true,
        message:
          "End-of-call-report and final transcript processed successfully",
        callId,
      });
    }

    // ✅ FALLBACK: Handle ANY event with transcript data for OpenAI processing
    const fallbackTranscriptData =
      message?.transcript || message?.messages || [];
    if (
      fallbackTranscriptData &&
      Array.isArray(fallbackTranscriptData) &&
      fallbackTranscriptData.length > 0
    ) {
      logger.debug(
        "[Webhook] FALLBACK: Processing transcript from unknown event type",
        "Component",
        {
          callId,
          eventType: message?.type || "unknown",
          transcriptLength: fallbackTranscriptData.length,
        },
      );

      try {
        // Process with OpenAI even if event type is unknown
        await processTranscriptWithOpenAI(fallbackTranscriptData, callId, req);

        return res.status(200).json({
          success: true,
          message: "Fallback transcript processing completed",
          callId,
          eventType: message?.type || "unknown",
        });
      } catch (error) {
        logger.error(
          "[Webhook] Fallback processing failed:",
          "Component",
          error,
        );
      }
    }

    // ✅ FALLBACK: Handle unknown event types
    logger.debug("[Webhook] Checking for unknown event type...", "Component", {
      messageType: message?.type,
      hasMessages: !!message?.messages,
      callId,
    });

    // ✅ FINAL FALLBACK: Log detailed info for debugging
    logger.warn(
      "[Webhook] No transcript data found in any expected field",
      "Component",
      {
        messageType: message?.type,
        callId,
        hasTranscript: !!message?.transcript,
        hasMessages: !!message?.messages,
        transcriptLength: (message?.transcript || message?.messages || [])
          .length,
        allFields: Object.keys(message || {}),
        rawPayload: JSON.stringify(req.body).substring(0, 500),
      },
    );

    return res.status(200).json({
      success: true,
      message: "Webhook received but not processed (unknown event type)",
      data: {
        type: message?.type,
        callId: callId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("[Webhook] Webhook processing failed:", "Component", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
