/**
 * 📝 TRANSCRIPT REPOSITORY
 *
 * Specialized repository for call transcripts with:
 * - Real-time conversation tracking
 * - High-performance queries for live updates
 * - Role-based filtering (user/assistant)
 * - Search and analytics support
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from "./BaseRepository";

export interface TranscriptFilters {
  callId?: string;
  role?: "user" | "assistant";
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ConversationFlow {
  callId: string;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  duration: number;
  firstMessage: Date;
  lastMessage: Date;
  conversation: Array<{
    id: number;
    role: string;
    content: string;
    timestamp: Date;
  }>;
}

export class TranscriptRepository extends BaseRepository<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, "transcript", "tenant_id");
  }

  protected getModel() {
    return this.prisma.transcript;
  }

  /**
   * 🎯 GET CONVERSATION BY CALL ID (Optimized for real-time display)
   */
  async getConversationByCallId(
    callId: string,
    tenantId?: string,
    limit: number = 1000,
  ): Promise<ConversationFlow> {
    const startTime = Date.now();

    try {
      logger.debug(
        "[TranscriptRepository] Getting conversation by call ID",
        "Repository",
        {
          callId,
          tenantId,
          limit,
        },
      );

      // Build where clause
      const where: any = { call_id: callId };
      if (tenantId) {
        where.tenant_id = tenantId;
      }

      // Get conversation messages in chronological order
      const messages = await this.prisma.transcript.findMany({
        where,
        select: {
          id: true,
          role: true,
          content: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: "asc",
        },
        take: limit,
      });

      // Calculate conversation statistics
      const userMessages = messages.filter((m) => m.role === "user").length;
      const assistantMessages = messages.filter(
        (m) => m.role === "assistant",
      ).length;

      let duration = 0;
      let firstMessage: Date | null = null;
      let lastMessage: Date | null = null;

      if (messages.length > 0) {
        firstMessage = messages[0].timestamp;
        lastMessage = messages[messages.length - 1].timestamp;
        duration = lastMessage.getTime() - firstMessage.getTime();
      }

      const conversation: ConversationFlow = {
        callId,
        totalMessages: messages.length,
        userMessages,
        assistantMessages,
        duration,
        firstMessage: firstMessage || new Date(),
        lastMessage: lastMessage || new Date(),
        conversation: messages,
      };

      const queryDuration = Date.now() - startTime;
      logger.success(
        "[TranscriptRepository] Conversation retrieved",
        "Repository",
        {
          callId,
          messageCount: messages.length,
          duration: `${queryDuration}ms`,
        },
      );

      return conversation;
    } catch (error) {
      logger.error(
        "[TranscriptRepository] GetConversationByCallId error",
        "Repository",
        {
          callId,
          tenantId,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 FIND TRANSCRIPTS WITH ADVANCED FILTERING
   */
  async findWithFilters(
    filters: TranscriptFilters & PaginationOptions,
    tenantId: string,
  ): Promise<PaginatedResult<any>> {
    const startTime = Date.now();

    try {
      logger.debug(
        "[TranscriptRepository] Finding with filters",
        "Repository",
        {
          filters,
          tenantId,
        },
      );

      const {
        callId,
        role,
        dateFrom,
        dateTo,
        search,
        page = 1,
        limit = 100,
        sortBy = "timestamp",
        sortDirection = "desc",
      } = filters;

      // Build complex where clause
      const where: any = {
        tenant_id: tenantId,
      };

      if (callId) where.call_id = callId;
      if (role) where.role = role;

      // Date range filtering
      if (dateFrom || dateTo) {
        where.timestamp = {};
        if (dateFrom) where.timestamp.gte = dateFrom;
        if (dateTo) where.timestamp.lte = dateTo;
      }

      // Text search in content
      if (search) {
        where.content = {
          contains: search,
          mode: "insensitive",
        };
      }

      const result = await this.findMany({
        where,
        page,
        limit,
        sortBy,
        sortDirection,
        tenantId,
        select: ["id", "call_id", "content", "role", "timestamp"],
      });

      const duration = Date.now() - startTime;
      logger.success(
        "[TranscriptRepository] Filtered search completed",
        "Repository",
        {
          resultCount: result.data.length,
          total: result.pagination.total,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        "[TranscriptRepository] FindWithFilters error",
        "Repository",
        {
          filters,
          tenantId,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 SEARCH ACROSS ALL CONVERSATIONS
   */
  async searchConversations(
    searchTerm: string,
    tenantId: string,
    options: PaginationOptions = { page: 1, limit: 50 },
  ): Promise<PaginatedResult<any>> {
    const startTime = Date.now();

    try {
      logger.debug(
        "[TranscriptRepository] Searching conversations",
        "Repository",
        {
          searchTerm,
          tenantId,
          options,
        },
      );

      // Search in transcript content
      const result = await this.findWithFilters(
        {
          search: searchTerm,
          ...options,
          sortBy: "timestamp",
          sortDirection: "desc",
        },
        tenantId,
      );

      // Group results by call_id to show conversation context
      const conversationMap = new Map();

      for (const transcript of result.data) {
        const callId = transcript.call_id;
        if (!conversationMap.has(callId)) {
          conversationMap.set(callId, {
            callId,
            matches: [],
            lastActivity: transcript.timestamp,
          });
        }

        conversationMap.get(callId).matches.push({
          id: transcript.id,
          role: transcript.role,
          content: transcript.content,
          timestamp: transcript.timestamp,
          searchMatch: true,
        });
      }

      // Convert to array and sort by last activity
      const conversations = Array.from(conversationMap.values()).sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime(),
      );

      const duration = Date.now() - startTime;
      logger.success(
        "[TranscriptRepository] Conversation search completed",
        "Repository",
        {
          searchTerm,
          conversationsFound: conversations.length,
          totalMatches: result.data.length,
          duration: `${duration}ms`,
        },
      );

      return {
        data: conversations,
        pagination: result.pagination,
      };
    } catch (error) {
      logger.error(
        "[TranscriptRepository] SearchConversations error",
        "Repository",
        {
          searchTerm,
          tenantId,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 ADD TRANSCRIPT WITH REAL-TIME OPTIMIZATION
   */
  async addTranscript(
    callId: string,
    content: string,
    role: "user" | "assistant",
    tenantId: string,
    timestamp?: Date,
  ): Promise<any> {
    const startTime = Date.now();

    try {
      logger.debug("[TranscriptRepository] Adding transcript", "Repository", {
        callId,
        role,
        contentLength: content.length,
        tenantId,
      });

      const transcriptData = {
        call_id: callId,
        content,
        role,
        tenant_id: tenantId,
        timestamp: timestamp || new Date(),
      };

      const result = await this.create(transcriptData, tenantId);

      const duration = Date.now() - startTime;
      logger.success("[TranscriptRepository] Transcript added", "Repository", {
        id: result.id,
        callId,
        role,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error("[TranscriptRepository] AddTranscript error", "Repository", {
        callId,
        role,
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 GET RECENT ACTIVITY (for real-time dashboard)
   */
  async getRecentActivity(
    tenantId: string,
    minutes: number = 30,
    limit: number = 100,
  ): Promise<any[]> {
    const startTime = Date.now();

    try {
      logger.debug(
        "[TranscriptRepository] Getting recent activity",
        "Repository",
        {
          tenantId,
          minutes,
          limit,
        },
      );

      const timeThreshold = new Date();
      timeThreshold.setMinutes(timeThreshold.getMinutes() - minutes);

      const result = await this.prisma.transcript.findMany({
        where: {
          tenant_id: tenantId,
          timestamp: {
            gte: timeThreshold,
          },
        },
        select: {
          id: true,
          call_id: true,
          content: true,
          role: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: "desc",
        },
        take: limit,
      });

      const duration = Date.now() - startTime;
      logger.success(
        "[TranscriptRepository] Recent activity retrieved",
        "Repository",
        {
          count: result.length,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        "[TranscriptRepository] GetRecentActivity error",
        "Repository",
        {
          tenantId,
          minutes,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 GET CONVERSATION ANALYTICS
   */
  async getConversationAnalytics(
    tenantId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<any> {
    const startTime = Date.now();

    try {
      logger.debug(
        "[TranscriptRepository] Getting conversation analytics",
        "Repository",
        {
          tenantId,
          dateFrom,
          dateTo,
        },
      );

      // Build date filter
      const dateFilter: any = {};
      if (dateFrom || dateTo) {
        dateFilter.timestamp = {};
        if (dateFrom) dateFilter.timestamp.gte = dateFrom;
        if (dateTo) dateFilter.timestamp.lte = dateTo;
      }

      const where = {
        tenant_id: tenantId,
        ...dateFilter,
      };

      // Execute multiple queries in parallel
      const [
        totalMessages,
        roleDistribution,
        avgMessageLength,
        activeConversations,
        messagesByHour,
      ] = await Promise.all([
        // Total messages
        this.prisma.transcript.count({ where }),

        // Role distribution
        this.prisma.transcript.groupBy({
          by: ["role"],
          where,
          _count: { role: true },
        }),

        // Average message length
        this.prisma.transcript.aggregate({
          where,
          _avg: {
            id: true, // Placeholder for content length calculation
          },
        }),

        // Unique conversations
        this.prisma.transcript.groupBy({
          by: ["call_id"],
          where,
          _count: { call_id: true },
        }),

        // Messages by hour
        this.prisma.$queryRaw`
          SELECT EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as count
          FROM transcript 
          WHERE tenant_id = ${tenantId}
          ${dateFrom ? `AND timestamp >= ${dateFrom}` : ""}
          ${dateTo ? `AND timestamp <= ${dateTo}` : ""}
          GROUP BY EXTRACT(HOUR FROM timestamp)
          ORDER BY hour
        `,
      ]);

      // Process results
      const byRole = roleDistribution.reduce(
        (acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byHour = (messagesByHour as any[]).reduce(
        (acc, item) => {
          acc[item.hour] = parseInt(item.count);
          return acc;
        },
        {} as Record<string, number>,
      );

      const duration = Date.now() - startTime;
      logger.success(
        "[TranscriptRepository] Conversation analytics completed",
        "Repository",
        {
          totalMessages,
          conversationsCount: activeConversations.length,
          duration: `${duration}ms`,
        },
      );

      return {
        totalMessages,
        totalConversations: activeConversations.length,
        byRole,
        byHour,
        averageMessagesPerConversation:
          activeConversations.length > 0
            ? totalMessages / activeConversations.length
            : 0,
      };
    } catch (error) {
      logger.error(
        "[TranscriptRepository] GetConversationAnalytics error",
        "Repository",
        {
          tenantId,
          dateFrom,
          dateTo,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 BATCH INSERT TRANSCRIPTS (for bulk operations)
   */
  async addBatchTranscripts(
    transcripts: Array<{
      call_id: string;
      content: string;
      role: "user" | "assistant";
      timestamp?: Date;
    }>,
    tenantId: string,
  ): Promise<number> {
    const startTime = Date.now();

    try {
      logger.debug(
        "[TranscriptRepository] Adding batch transcripts",
        "Repository",
        {
          count: transcripts.length,
          tenantId,
        },
      );

      const transcriptData = transcripts.map((transcript) => ({
        ...transcript,
        tenant_id: tenantId,
        timestamp: transcript.timestamp || new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const result = await this.createMany(transcriptData, tenantId);

      const duration = Date.now() - startTime;
      logger.success(
        "[TranscriptRepository] Batch transcripts added",
        "Repository",
        {
          created: result,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        "[TranscriptRepository] AddBatchTranscripts error",
        "Repository",
        {
          count: transcripts.length,
          tenantId,
          error,
        },
      );
      throw error;
    }
  }
}
