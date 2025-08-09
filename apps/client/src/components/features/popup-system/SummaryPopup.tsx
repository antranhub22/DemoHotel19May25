import * as React from 'react';
import { usePopup } from "@/components/features/popup-system";
import logger from '@shared/utils/logger';
import { createElement, useEffect, useState } from 'react';

interface SummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SummaryPopup: React.FC<SummaryPopupProps> = ({ isOpen, onClose }) => {
  const { showSummary, removePopup } = usePopup();
  const [isVisible, setIsVisible] = useState(false);

  // ✅ NEW: Test function to trigger summary popup
  const testSummaryPopup = () => {
    logger.debug(
      "🧪 [SummaryPopup] Testing summary popup trigger",
      "Component",
    );

    const summaryContent = createElement(
      "div",
      {
        style: {
          padding: "20px",
          textAlign: "center",
          maxWidth: "400px",
        },
      },
      [
        createElement(
          "h3",
          {
            key: "title",
            style: {
              marginBottom: "16px",
              color: "#333",
              fontSize: "18px",
              fontWeight: "600",
            },
          },
          "📋 Test Call Summary",
        ),

        createElement(
          "div",
          {
            key: "icon",
            style: { fontSize: "48px", marginBottom: "16px" },
          },
          "✅",
        ),

        createElement(
          "p",
          {
            key: "message",
            style: {
              marginBottom: "16px",
              lineHeight: "1.5",
              color: "#333",
              fontSize: "16px",
            },
          },
          "This is a test summary popup!",
        ),

        createElement(
          "div",
          {
            key: "test-info",
            style: {
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#f0f9ff",
              borderRadius: "6px",
              fontSize: "14px",
            },
          },
          [
            createElement(
              "div",
              {
                key: "test-title",
                style: {
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#1e40af",
                },
              },
              "Test Summary:",
            ),
            createElement(
              "div",
              {
                key: "test-details",
                style: { color: "#374151" },
              },
              "Summary popup is working correctly!",
            ),
          ],
        ),
      ],
    );

    showSummary(summaryContent, {
      title: "Test Summary",
      priority: "medium",
    });
  };

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Summary Popup Test</h2>
        <p className="mb-4">Click the button below to test summary popup:</p>

        <button
          onClick={testSummaryPopup}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🧪 Test Summary Popup
        </button>

        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};
