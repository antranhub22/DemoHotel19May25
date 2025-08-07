import * as React from 'react';
/**
 * Billing & Subscription Management - Complete UI Component
 * Comprehensive billing interface with subscription management, payment processing,
 * invoice tracking, usage analytics, and customer portal integration
 */

import { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  FileText,
  TrendingUp,
  Settings,
  Bell,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  Database,
  Zap,
  Shield,
  Crown,
  Calendar,
  Filter,
  Search,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import logger from '@shared/utils/logger';

// Domain imports - Hooks temporarily disabled
import {
  // useBilling,
  // useSubscriptionManagement,
  // usePaymentManagement,
  // useInvoiceManagement,
  // useUsageAnalytics,
  // usePricingPlans,
  // useBillingNotifications,
  // useCustomerPortal,
  // useBillingAutoRefresh,
  BillingUtils,
  PLAN_LIMITS,
  PLAN_FEATURES,
  type SubscriptionPlan,
  type BillingCycle,
  type PricingConfig,
} from "@/domains/billing-subscription";

// ============================================
// MAIN COMPONENT
// ============================================

const BillingSubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "";

  // Domain hooks - TEMPORARILY DISABLED DUE TO CIRCULAR DEPENDENCY
  // const billing = useBilling();
  // const subscriptionMgmt = useSubscriptionManagement();
  // const paymentMgmt = usePaymentManagement();
  // const invoiceMgmt = useInvoiceManagement();
  // const usageAnalytics = useUsageAnalytics();
  // const pricingPlans = usePricingPlans();
  // const notifications = useBillingNotifications();
  // const customerPortal = useCustomerPortal();

  // Auto-refresh billing data - TEMPORARILY DISABLED
  // useBillingAutoRefresh(tenantId);

  // MOCK DATA FOR BILLING MANAGEMENT
  const billing = { currentSubscription: null, isLoading: false };
  const subscriptionMgmt = { plans: [], upgradePlan: () => {} };
  const paymentMgmt = { methods: [], addPaymentMethod: () => {} };
  const invoiceMgmt = { invoices: [], downloadInvoice: () => {} };
  const usageAnalytics = { usage: {}, limits: {} };
  const pricingPlans = { plans: [], features: {} };
  const notifications = { notifications: [], markAsRead: () => {} };
  const customerPortal = { openPortal: () => {} };

  // Local state
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("basic");
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("monthly");

  // Initialize data
  useEffect(() => {
    if (tenantId) {
      billing.actions.fetchSubscriptions(tenantId);
      billing.actions.fetchPaymentMethods(tenantId);
      billing.actions.fetchInvoices({ tenantId, limit: 10 });
      billing.actions.fetchCurrentUsage(tenantId);
      billing.actions.fetchNotifications({ tenantId, limit: 20 });
      pricingPlans.actions.fetchPricingConfig();
    }
  }, [tenantId]);

  // Computed values
  const currentPlan = subscriptionMgmt.currentPlan;
  const isTrialing = billing.isTrialing;
  const hasActiveSubscription = billing.hasActiveSubscription;

  // ============================================
  // OVERVIEW TAB COMPONENT
  // ============================================

  const OverviewTab = () => {
    const usage = usageAnalytics.usageMetrics;
    const subscription = subscriptionMgmt.currentSubscription;

    return (
      <div className="space-y-6">
        {/* Current Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Plan</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={isTrialing ? "secondary" : "default"}
                      className="capitalize"
                    >
                      {subscription.plan}
                      {isTrialing && " (Trial)"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        BillingUtils.getSubscriptionStatusColor(
                          subscription.status,
                        ),
                      )}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Billing Cycle
                  </Label>
                  <p className="mt-1 capitalize">{subscription.cycle}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {isTrialing ? "Trial Ends" : "Next Billing"}
                  </Label>
                  <p className="mt-1">
                    {BillingUtils.formatDate(
                      isTrialing
                        ? subscription.trialEnd!
                        : subscription.currentPeriodEnd,
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No active subscription</p>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={() => setShowUpgradeModal(true)}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => customerPortal.openPortal(tenantId)}
                disabled={customerPortal.loading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Overview Cards */}
        {usage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <UsageCard
              title="Voice Calls"
              icon={<Phone className="h-4 w-4" />}
              usage={usage.voiceCalls}
              unit="calls"
            />
            <UsageCard
              title="API Requests"
              icon={<Zap className="h-4 w-4" />}
              usage={usage.apiRequests}
              unit="requests"
            />
            <UsageCard
              title="Storage"
              icon={<Database className="h-4 w-4" />}
              usage={usage.storage}
              unit="MB"
            />
            <UsageCard
              title="Staff Users"
              icon={<Users className="h-4 w-4" />}
              usage={usage.staffUsers}
              unit="users"
            />
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Invoices
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("invoices")}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoiceMgmt.invoices.slice(0, 3).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {BillingUtils.formatDate(invoice.created)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {BillingUtils.formatCurrency(invoice.amount)}
                    </p>
                    <Badge
                      variant={
                        invoice.status === "paid" ? "default" : "secondary"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {notifications.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {notifications.unreadCount}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("notifications")}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-2 py-2"
                >
                  <span className="text-lg">
                    {BillingUtils.getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {BillingUtils.formatDateTime(notification.created)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ============================================
  // SUBSCRIPTION TAB COMPONENT
  // ============================================

  const SubscriptionTab = () => {
    return (
      <div className="space-y-6">
        {/* Current Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan Details</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionMgmt.currentSubscription ? (
              <PlanDetails
                subscription={subscriptionMgmt.currentSubscription}
              />
            ) : (
              <p className="text-muted-foreground">No active subscription</p>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.keys(PLAN_LIMITS).map((plan) => (
                <PlanCard
                  key={plan}
                  plan={plan as SubscriptionPlan}
                  isCurrentPlan={plan === currentPlan}
                  onSelect={() => {
                    setSelectedPlan(plan as SubscriptionPlan);
                    setShowUpgradeModal(true);
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription History */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionMgmt.subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="capitalize">
                      {subscription.plan}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscription.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {BillingUtils.formatDate(subscription.currentPeriodStart)}{" "}
                      - {BillingUtils.formatDate(subscription.currentPeriodEnd)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============================================
  // USAGE CARD COMPONENT
  // ============================================

  const UsageCard = ({
    title,
    icon,
    usage,
    unit,
  }: {
    title: string;
    icon: React.ReactNode;
    usage: any;
    unit: string;
  }) => {
    const isUnlimited = usage.limit === -1;
    const percentage = isUnlimited ? 0 : (usage.count / usage.limit) * 100;
    const statusColor = BillingUtils.getUsageStatusColor(percentage);

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {usage.count.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {isUnlimited
                  ? "Unlimited"
                  : `/ ${usage.limit.toLocaleString()}`}{" "}
                {unit}
              </span>
            </div>
            {!isUnlimited && <Progress value={percentage} className="h-2" />}
            <div className="flex justify-between text-xs">
              <span
                className={cn(
                  "font-medium",
                  usage.isOverLimit && "text-red-600",
                  usage.isNearLimit && !usage.isOverLimit && "text-orange-600",
                )}
              >
                {isUnlimited ? "Unlimited" : `${percentage.toFixed(1)}% used`}
              </span>
              {usage.isOverLimit && (
                <span className="text-red-600 font-medium">Over limit!</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================
  // PLAN CARD COMPONENT
  // ============================================

  const PlanCard = ({
    plan,
    isCurrentPlan,
    onSelect,
  }: {
    plan: SubscriptionPlan;
    isCurrentPlan: boolean;
    onSelect: () => void;
  }) => {
    const limits = PLAN_LIMITS[plan];
    const features = PLAN_FEATURES[plan];
    const pricing = pricingPlans.pricingConfig.find(
      (p) => p.plan === plan && p.cycle === "monthly",
    );

    return (
      <Card
        className={cn(
          "relative cursor-pointer transition-colors",
          isCurrentPlan && "ring-2 ring-primary",
          plan === "premium" && "border-orange-500",
        )}
      >
        {plan === "premium" && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-orange-500">Popular</Badge>
          </div>
        )}

        <CardHeader className="text-center">
          <CardTitle className="capitalize">{plan}</CardTitle>
          {pricing && (
            <div className="text-2xl font-bold">
              {pricingPlans.formatPrice(pricing.amount)}
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Limits</h4>
            <ul className="text-sm space-y-1">
              <li>
                {limits.monthlyCallLimit === -1
                  ? "Unlimited"
                  : limits.monthlyCallLimit.toLocaleString()}{" "}
                voice calls
              </li>
              <li>
                {limits.maxStaffUsers === -1
                  ? "Unlimited"
                  : limits.maxStaffUsers}{" "}
                staff users
              </li>
              <li>
                {limits.maxHotelLocations === -1
                  ? "Unlimited"
                  : limits.maxHotelLocations}{" "}
                locations
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Features</h4>
            <ul className="text-sm space-y-1">
              {features.voiceCloning && <li>✓ Voice Cloning</li>}
              {features.multiLocation && <li>✓ Multi-location</li>}
              {features.whiteLabel && <li>✓ White Label</li>}
              {features.prioritySupport && <li>✓ Priority Support</li>}
            </ul>
          </div>

          <Button
            className="w-full"
            variant={isCurrentPlan ? "secondary" : "default"}
            onClick={onSelect}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? "Current Plan" : "Select Plan"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // ============================================
  // PLAN DETAILS COMPONENT
  // ============================================

  const PlanDetails = ({ subscription }: { subscription: any }) => {
    const period = BillingUtils.getCurrentBillingPeriod(subscription);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">
              Plan & Status
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="capitalize">
                {subscription.plan}
              </Badge>
              <Badge variant="outline">{subscription.status}</Badge>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">
              Billing Cycle
            </Label>
            <p className="mt-1 capitalize">{subscription.cycle}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">
              Current Period
            </Label>
            <p className="mt-1">
              {BillingUtils.formatDate(subscription.currentPeriodStart)} -{" "}
              {BillingUtils.formatDate(subscription.currentPeriodEnd)}
            </p>
            <p className="text-sm text-muted-foreground">
              {period.daysRemaining} days remaining
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Actions</Label>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
              {subscription.status === "active" &&
                !subscription.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
              {subscription.cancelAtPeriodEnd && (
                <Button variant="outline" size="sm">
                  Reactivate Subscription
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => customerPortal.openPortal(tenantId)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage in Portal
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER MAIN COMPONENT
  // ============================================

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payments, and billing preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => billing.actions.fetchSubscriptions(tenantId)}
            disabled={billing.isLoading}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 mr-2",
                billing.isLoading && "animate-spin",
              )}
            />
            Refresh
          </Button>
          <Button onClick={() => customerPortal.openPortal(tenantId)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Customer Portal
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 px-1.5 py-0.5 text-xs"
              >
                {notifications.unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTab />
        </TabsContent>

        <TabsContent value="payments">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Payment methods management coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Invoice management coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Usage analytics coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Notifications management coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upgrade Plan Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Plan</DialogTitle>
            <DialogDescription>
              Select your new plan and billing cycle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Plan</Label>
              <Select
                value={selectedPlan}
                onValueChange={(value) =>
                  setSelectedPlan(value as SubscriptionPlan)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Billing Cycle</Label>
              <Select
                value={selectedCycle}
                onValueChange={(value) =>
                  setSelectedCycle(value as BillingCycle)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (Save 17%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle upgrade logic
                setShowUpgradeModal(false);
              }}
            >
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingSubscriptionManagement;
