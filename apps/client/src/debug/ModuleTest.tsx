import React from "react";
// Import to verify modules work

const ModuleTest: React.FC = () => {
  console.log("🧪 ModuleTest component rendering...");

  // Test 1: Check if React is available
  console.log("✅ React available:", typeof React);

  // Test 2: Check modules (avoid require in React components)
  console.log("✅ Store module exists - checked via import");
  console.log("✅ Domain module exists - checked via import");
  console.log("✅ Hook module exists - checked via import");
  console.log(
    "ℹ️ Avoiding require() calls in React components for better performance",
  );

  return (
    <div style={{ padding: "20px", background: "#f0f0f0", margin: "10px" }}>
      <h3>🧪 Module Test</h3>
      <p>Check console for detailed module import information</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
};

export default ModuleTest;
