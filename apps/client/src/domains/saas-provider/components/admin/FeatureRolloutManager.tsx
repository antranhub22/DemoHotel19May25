/**
 * Feature Rollout Manager
 * Manage feature flags and rollout strategies
 */

import { logger } from "@shared/utils/logger";
import React, { useEffect, useState } from "react";
import { usePlatformAdmin } from "../../hooks/usePlatformAdmin";
import { FeatureFlag, SubscriptionPlan } from "../../types/saasProvider.types";

interface CreateFeatureFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    flag: Omit<FeatureFlag, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
}

const CreateFeatureFlagModal: React.FC<CreateFeatureFlagModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    enabled: false,
    rolloutPercentage: 0,
    targetAudience: {
      plans: [] as SubscriptionPlan[],
      tenantIds: [] as string[],
      regions: [] as string[],
    },
    createdBy: "admin",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        description: "",
        enabled: false,
        rolloutPercentage: 0,
        targetAudience: {
          plans: [],
          tenantIds: [],
          regions: [],
        },
        createdBy: "admin",
      });
      onClose();
    } catch (error) {
      logger.error(
        "[CreateFeatureFlagModal] Error creating feature flag:",
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanToggle = (plan: SubscriptionPlan) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        plans: prev.targetAudience.plans.includes(plan)
          ? prev.targetAudience.plans.filter((p) => p !== plan)
          : [...prev.targetAudience.plans, plan],
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🚩 Create Feature Flag
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feature Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., voice-cloning-v2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe what this feature does..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, enabled: e.target.checked }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="enabled"
              className="text-sm font-medium text-gray-700"
            >
              Enable feature immediately
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rollout Percentage: {formData.rolloutPercentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.rolloutPercentage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  rolloutPercentage: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Subscription Plans
            </label>
            <div className="space-y-2">
              {(
                [
                  "trial",
                  "basic",
                  "premium",
                  "enterprise",
                ] as SubscriptionPlan[]
              ).map((plan) => (
                <label key={plan} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.targetAudience.plans.includes(plan)}
                    onChange={() => handlePlanToggle(plan)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {plan}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md 
                                     hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                                     transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Feature Flag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FeatureRolloutManager: React.FC = () => {
  const {
    featureFlags,
    isLoadingFlags,
    fetchFeatureFlags,
    updateFeatureFlag,
    createFeatureFlag,
    error,
  } = usePlatformAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  const handleToggleFlag = async (flagId: string, enabled: boolean) => {
    try {
      await updateFeatureFlag(flagId, { enabled });
      logger.debug("[FeatureRolloutManager] Feature flag toggled:", {
        flagId,
        enabled,
      });
    } catch (error) {
      logger.error(
        "[FeatureRolloutManager] Error toggling feature flag:",
        error,
      );
    }
  };

  const handleUpdateRollout = async (
    flagId: string,
    rolloutPercentage: number,
  ) => {
    try {
      await updateFeatureFlag(flagId, { rolloutPercentage });
      logger.debug("[FeatureRolloutManager] Rollout percentage updated:", {
        flagId,
        rolloutPercentage,
      });
    } catch (error) {
      logger.error("[FeatureRolloutManager] Error updating rollout:", error);
    }
  };

  const handleCreateFlag = async (
    flag: Omit<FeatureFlag, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await createFeatureFlag(flag);
      logger.debug("[FeatureRolloutManager] Feature flag created successfully");
    } catch (error) {
      logger.error(
        "[FeatureRolloutManager] Error creating feature flag:",
        error,
      );
      throw error;
    }
  };

  const getStatusColor = (flag: FeatureFlag): string => {
    if (!flag.enabled) return "bg-gray-100 text-gray-800";
    if (flag.rolloutPercentage === 100) return "bg-green-100 text-green-800";
    if (flag.rolloutPercentage > 0) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (flag: FeatureFlag): string => {
    if (!flag.enabled) return "Disabled";
    if (flag.rolloutPercentage === 100) return "Full Rollout";
    if (flag.rolloutPercentage > 0) return `${flag.rolloutPercentage}% Rollout`;
    return "Created";
  };

  if (isLoadingFlags) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading feature flags...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            🚩 Feature Rollout Manager
          </h2>
          <p className="text-gray-600 mt-1">
            Manage feature flags and gradual rollouts
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                             transition-colors flex items-center space-x-2"
        >
          <span>🚩</span>
          <span>Create Feature Flag</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Flags</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {featureFlags.length}
              </p>
            </div>
            <span className="text-2xl">🚩</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enabled</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {featureFlags.filter((f) => f.enabled).length}
              </p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Partial Rollout
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {
                  featureFlags.filter(
                    (f) =>
                      f.enabled &&
                      f.rolloutPercentage > 0 &&
                      f.rolloutPercentage < 100,
                  ).length
                }
              </p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Full Rollout</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {
                  featureFlags.filter(
                    (f) => f.enabled && f.rolloutPercentage === 100,
                  ).length
                }
              </p>
            </div>
            <span className="text-2xl">🚀</span>
          </div>
        </div>
      </div>

      {/* Feature Flags List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {featureFlags.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">🚩</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              No feature flags yet
            </h3>
            <p className="text-gray-600 mt-2">
              Get started by creating your first feature flag.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {featureFlags.map((flag) => (
              <div key={flag.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {flag.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(flag)}`}
                      >
                        {getStatusText(flag)}
                      </span>
                    </div>

                    <p className="text-gray-600 mt-1">{flag.description}</p>

                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                      <span>
                        Created: {flag.createdAt.toLocaleDateString()}
                      </span>
                      <span>
                        Updated: {flag.updatedAt.toLocaleDateString()}
                      </span>
                      <span>By: {flag.createdBy}</span>
                    </div>

                    {/* Target Audience */}
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">
                        Target Plans:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {flag.targetAudience.plans.length === 0 ? (
                          <span className="text-xs text-gray-500">
                            All plans
                          </span>
                        ) : (
                          flag.targetAudience.plans.map((plan) => (
                            <span
                              key={plan}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {plan}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col items-end space-y-3">
                    {/* Enable/Disable Toggle */}
                    <label className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Enabled</span>
                      <input
                        type="checkbox"
                        checked={flag.enabled}
                        onChange={(e) =>
                          handleToggleFlag(flag.id, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>

                    {/* Rollout Percentage */}
                    {flag.enabled && (
                      <div className="w-48">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">Rollout</span>
                          <span className="text-sm font-medium text-gray-900">
                            {flag.rolloutPercentage}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={flag.rolloutPercentage}
                          onChange={(e) =>
                            handleUpdateRollout(
                              flag.id,
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rollout Progress Bar */}
                {flag.enabled && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${flag.rolloutPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0% of users</span>
                      <span>
                        {flag.rolloutPercentage}% of users have access
                      </span>
                      <span>100% of users</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Feature Flag Modal */}
      <CreateFeatureFlagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateFlag}
      />
    </div>
  );
};

export default FeatureRolloutManager;
