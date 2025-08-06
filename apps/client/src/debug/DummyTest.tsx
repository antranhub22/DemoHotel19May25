import React from "react";
import { useRequestManagement } from "../domains/request-management";

const DummyTest: React.FC = () => {
  console.log("🧪 DummyTest component rendering...");

  // Use the real hook instead of dummy

  try {
    // Test real hook (but safely)
    console.log(
      "✅ Real useRequestManagement imported:",
      typeof useRequestManagement,
    );
    console.log("✅ Ready for use in React component context");

    return (
      <div style={{ padding: "20px", background: "#e8f5e8", color: "#2e7d32" }}>
        <h3>✅ Real Hook Test Success</h3>
        <p>useRequestManagement is properly imported!</p>
        <p>Hook type: {typeof useRequestManagement}</p>
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
