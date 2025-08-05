import React from "react";

const ModuleTest: React.FC = () => {
  console.log("🧪 ModuleTest component rendering...");

  // Test 1: Check if React is available
  console.log("✅ React available:", typeof React);

  // Test 2: Check if we can import from store
  try {
    const store = require("../../store");
    console.log("✅ Store imported:", typeof store);
    console.log("✅ Store keys:", Object.keys(store));
  } catch (error) {
    console.error("❌ Store import failed:", error);
  }

  // Test 3: Check if we can import from domain
  try {
    const domain = require("../../domains/request-management");
    console.log("✅ Domain imported:", typeof domain);
    console.log("✅ Domain keys:", Object.keys(domain));
  } catch (error) {
    console.error("❌ Domain import failed:", error);
  }

  // Test 4: Check if we can import hook directly
  try {
    const hook = require("../../domains/request-management/hooks/useRequestManagement");
    console.log("✅ Hook imported:", typeof hook);
    console.log("✅ Hook keys:", Object.keys(hook));
  } catch (error) {
    console.error("❌ Hook import failed:", error);
  }

  return (
    <div style={{ padding: "20px", background: "#f0f0f0", margin: "10px" }}>
      <h3>🧪 Module Test</h3>
      <p>Check console for detailed module import information</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
};

export default ModuleTest;
