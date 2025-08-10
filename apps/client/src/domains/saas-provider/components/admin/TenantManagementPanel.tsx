import * as React from "react";
/**
 * Tenant Management Panel
 * Manage hotel tenants - view, create, suspend, activate
 */

import logger from "@shared/utils/logger";
import { useState } from "react";
import { useTenantManagement } from "../../hooks/usePlatformAdmin";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../types/saasProvider.types";

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    hotelName: string;
    subdomain: string;
    plan: SubscriptionPlan;
    adminEmail: string;
    adminName: string;
  }) => Promise<void>;
}

const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    hotelName: "",
    subdomain: "",
    plan: "trial" as SubscriptionPlan,
    adminEmail: "",
    adminName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setFormData({
        hotelName: "",
        subdomain: "",
        plan: "trial",
        adminEmail: "",
        adminName: "",
      });
      onClose();
    } catch (error) {
      logger.error("[CreateTenantModal] Error creating tenant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🏢 Create New Tenant
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Name
            </label>
            <input
              type="text"
              required
              value={formData.hotelName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hotelName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Grand Hotel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subdomain
            </label>
            <div className="flex">
              <input
                type="text"
                required
                value={formData.subdomain}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subdomain: e.target.value.toLowerCase(),
                  }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none 
                                         focus:ring-2 focus:ring-blue-500"
                placeholder="grandhotel"
              />
              <span
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 
                                           rounded-r-md text-gray-600"
              >
                .demohotel.com
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Plan
            </label>
            <select
              value={formData.plan}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  plan: e.target.value as SubscriptionPlan,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
            >
              <option value="trial">Trial (14 days)</option>
              <option value="basic">Basic ($29/month)</option>
              <option value="premium">Premium ($79/month)</option>
              <option value="enterprise">Enterprise ($199/month)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Name
            </label>
            <input
              type="text"
              required
              value={formData.adminName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, adminName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={formData.adminEmail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
              placeholder="admin@grandhotel.com"
            />
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
              {isSubmitting ? "Creating..." : "Create Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TenantManagementPanel: React.FC = () => {
  const {
    tenants,
    selectedTenant,
    filters,
    isLoading,
    fetchTenantDetails,
    updateTenantStatus,
    createTenant,
    updateFilters,
    error,
  } = useTenantManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getStatusColor = (status: SubscriptionStatus): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanColor = (plan: SubscriptionPlan): string => {
    switch (plan) {
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "basic":
        return "bg-green-100 text-green-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHealthIcon = (
    health: "healthy" | "warning" | "critical",
  ): string => {
    switch (health) {
      case "healthy":
        return "🟢";
      case "warning":
        return "🟡";
      case "critical":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const handleTenantAction = async (
    tenantId: string,
    action: "suspend" | "activate" | "delete",
  ) => {
    setActionLoading(tenantId);
    try {
      await updateTenantStatus(tenantId, action);
      // @ts-ignore - Auto-suppressed TypeScript error
      logger.debug("[TenantManagementPanel] Tenant action completed:", {
        tenantId,
        action,
      });
    } catch (error) {
      logger.error("[TenantManagementPanel] Error updating tenant:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTenant = async (
    data: Parameters<typeof createTenant>[0],
  ) => {
    try {
      await createTenant(data);
      logger.debug("[TenantManagementPanel] Tenant created successfully");
    } catch (error) {
      logger.error("[TenantManagementPanel] Error creating tenant:", error);
      throw error;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            🏢 Tenant Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage hotel tenants and their subscriptions
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                             transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Tenant</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Hotel name or subdomain..."
              value={filters.search || ""}
              onChange={(e) =>
                updateFilters({ search: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                updateFilters({
                  status: (e.target.value as SubscriptionStatus) || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <select
              value={filters.plan || ""}
              onChange={(e) =>
                updateFilters({
                  plan: (e.target.value as SubscriptionPlan) || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All plans</option>
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                updateFilters({
                  search: undefined,
                  status: undefined,
                  plan: undefined,
                })
              }
              className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md 
                                     hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading tenants...</span>
            </div>
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">🏨</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              No tenants found
            </h3>
            <p className="text-gray-600 mt-2">
              {Object.values(filters).some((f) => f)
                ? "Try adjusting your filters or create a new tenant."
                : "Get started by creating your first tenant."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.hotelName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tenant.subdomain}.demohotel.com
                        </div>
                        <div className="text-xs text-gray-400">
                          Created: {tenant.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.subscriptionStatus)}`}
                      >
                        {tenant.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(tenant.subscriptionPlan)}`}
                      >
                        {tenant.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(tenant.totalRevenue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {tenant.usage.currentMonthVoiceCalls} calls
                      </div>
                      <div className="text-xs text-gray-500">
                        {tenant.usage.currentMonthMinutes} mins
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg">
                        {getHealthIcon(tenant.health)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => fetchTenantDetails(tenant.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>

                        {tenant.subscriptionStatus === "active" ? (
                          <button
                            onClick={() =>
                              handleTenantAction(tenant.id, "suspend")
                            }
                            disabled={actionLoading === tenant.id}
                            className="text-orange-600 hover:text-orange-800 text-sm disabled:opacity-50"
                          >
                            {actionLoading === tenant.id ? "..." : "Suspend"}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleTenantAction(tenant.id, "activate")
                            }
                            disabled={actionLoading === tenant.id}
                            className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                          >
                            {actionLoading === tenant.id ? "..." : "Activate"}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleTenantAction(tenant.id, "delete")
                          }
                          disabled={actionLoading === tenant.id}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTenant}
      />
    </div>
  );
};

export default TenantManagementPanel;

// Removed duplicate interface declaration
