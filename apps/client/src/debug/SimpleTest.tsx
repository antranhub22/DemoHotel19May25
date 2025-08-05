import React from "react";

const SimpleTest: React.FC = () => {
  console.log("🧪 SimpleTest component rendering...");

  try {
    // Test 1: Import from store
    const { useAppDispatch, useAppSelector } = require("../../store");
    console.log("✅ Store hooks imported:", {
      useAppDispatch: typeof useAppDispatch,
      useAppSelector: typeof useAppSelector,
    });

    // Test 2: Import from domain
    const {
      useRequestManagement,
    } = require("../../domains/request-management");
    console.log(
      "✅ useRequestManagement imported:",
      typeof useRequestManagement,
    );

    // Test 3: Call hook
    const result = useRequestManagement();
    console.log(
      "✅ useRequestManagement called successfully:",
      Object.keys(result),
    );

    return (
      <div style={{ padding: "20px", background: "#e8f5e8", color: "#2e7d32" }}>
        <h3>✅ Simple Test Success</h3>
        <p>useRequestManagement is working!</p>
        <p>Returned keys: {Object.keys(result).join(", ")}</p>
      </div>
    );
  } catch (error) {
    console.error("❌ SimpleTest failed:", error);
    return (
      <div style={{ padding: "20px", background: "#ffebee", color: "#c62828" }}>
        <h3>❌ Simple Test Failed</h3>
        <p>Error: {error.toString()}</p>
        <pre style={{ fontSize: "11px", whiteSpace: "pre-wrap" }}>
          {error.stack}
        </pre>
      </div>
    );
  }
};

export default SimpleTest;
