import { useAssistant } from "@/context";
import { useCallback, useEffect, useState } from "react";

export interface SummaryProgressionState {
  status: "idle" | "processing" | "completed" | "error";
  progress: number;
  currentStep: string;
  currentStepIndex: number;
  totalSteps: number;
  estimatedTime: number;
  errorMessage: string;
  startTime: Date | null;
  endTime: Date | null;
}

export interface UseSummaryProgressionReturn {
  progression: SummaryProgressionState;
  startProcessing: () => void;
  updateProgress: (progress: number, step?: string) => void;
  completeStep: () => void;
  setError: (message: string) => void;
  complete: () => void;
  reset: () => void;
}

const INITIAL_STATE: SummaryProgressionState = {
  status: "idle",
  progress: 0,
  currentStep: "",
  currentStepIndex: 0,
  totalSteps: 4,
  estimatedTime: 30,
  errorMessage: "",
  startTime: null,
  endTime: null,
};

const STEPS = [
  "Receiving call data from Vapi.ai",
  "Processing transcript with OpenAI",
  "Generating comprehensive summary",
  "Extracting service requests",
];

export const useSummaryProgression = (): UseSummaryProgressionReturn => {
  const [progression, setProgression] =
    useState<SummaryProgressionState>(INITIAL_STATE);
  const { serviceRequests, callSummary } = useAssistant();

  // Auto-detect completion when data is available
  useEffect(() => {
    if (
      progression.status === "processing" &&
      (serviceRequests?.length > 0 || callSummary)
    ) {
      complete();
    }
  }, [serviceRequests, callSummary, progression.status]);

  const startProcessing = useCallback(() => {
    setProgression((prev) => ({
      ...prev,
      status: "processing",
      progress: 0,
      currentStepIndex: 0,
      currentStep: STEPS[0],
      startTime: new Date(),
      endTime: null,
      errorMessage: "",
    }));
  }, []);

  const updateProgress = useCallback((progress: number, step?: string) => {
    setProgression((prev) => ({
      ...prev,
      progress,
      currentStep: step || prev.currentStep,
    }));
  }, []);

  const completeStep = useCallback(() => {
    setProgression((prev) => {
      const nextStepIndex = Math.min(
        prev.currentStepIndex + 1,
        prev.totalSteps - 1,
      );
      const isLastStep = nextStepIndex >= prev.totalSteps - 1;

      return {
        ...prev,
        currentStepIndex: nextStepIndex,
        currentStep: isLastStep
          ? STEPS[prev.totalSteps - 1]
          : STEPS[nextStepIndex],
        progress: ((nextStepIndex + 1) / prev.totalSteps) * 100,
      };
    });
  }, []);

  const setError = useCallback((message: string) => {
    setProgression((prev) => ({
      ...prev,
      status: "error",
      errorMessage: message,
      endTime: new Date(),
    }));
  }, []);

  const complete = useCallback(() => {
    setProgression((prev) => ({
      ...prev,
      status: "completed",
      progress: 100,
      currentStepIndex: prev.totalSteps - 1,
      currentStep: STEPS[prev.totalSteps - 1],
      endTime: new Date(),
    }));
  }, []);

  const reset = useCallback(() => {
    setProgression(INITIAL_STATE);
  }, []);

  // Expose a global updater so WebSocket handler can drive progression
  // without tight coupling across components
  // This is safe and optional; if not needed it remains unused
  if (typeof window !== "undefined") {
    (window as any).updateSummaryProgression = (data: any) => {
      setProgression((prev) => ({
        ...prev,
        status: (data.status as any) || prev.status,
        progress:
          typeof data.progress === "number" ? data.progress : prev.progress,
        currentStep: data.currentStep || prev.currentStep,
        currentStepIndex:
          typeof data.currentStepIndex === "number"
            ? data.currentStepIndex
            : prev.currentStepIndex,
      }));
    };
  }

  return {
    progression,
    startProcessing,
    updateProgress,
    completeStep,
    setError,
    complete,
    reset,
  };
};
