import React from "react";

const DummyTest: React.FC = () => {
  console.log("🧪 DummyTest component rendering...");

  // Tạm thời thay thế
  const useRequestManagement = () => {
    console.log("Dummy useRequestManagement called");
    return {
      requests: [],
      requestCounts: { total: 0, pending: 0, completed: 0 },
      selectedRequest: null,
      filters: {},
      isLoading: false,
      error: null,
      loadRequests: () => console.log("Dummy loadRequests called"),
      selectRequest: () => console.log("Dummy selectRequest called"),
      updateFilters: () => console.log("Dummy updateFilters called"),
      clearFilters: () => console.log("Dummy clearFilters called"),
      clearCurrentError: () => console.log("Dummy clearCurrentError called"),
      setupAutoRefresh: () => console.log("Dummy setupAutoRefresh called"),
    };
  };

  try {
    // Test dummy hook
    const result = useRequestManagement();
    console.log("✅ Dummy hook called successfully:", Object.keys(result));

    return (
      <div style={{ padding: "20px", background: "#e8f5e8", color: "#2e7d32" }}>
        <h3>✅ Dummy Test Success</h3>
        <p>Dummy useRequestManagement is working!</p>
        <p>Returned keys: {Object.keys(result).join(", ")}</p>
      </div>
    );
  } catch (error) {
    console.error("❌ DummyTest failed:", error);
    return (
      <div style={{ padding: "20px", background: "#ffebee", color: "#c62828" }}>
        <h3>❌ Dummy Test Failed</h3>
        <p>Error: {error.toString()}</p>
        <pre style={{ fontSize: "11px", whiteSpace: "pre-wrap" }}>
          {error.stack}
        </pre>
      </div>
    );
  }
};

export default DummyTest;
