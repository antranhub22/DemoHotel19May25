/**
 * SaaS Provider Domain - Stripe Service
 * Billing and payment processing integration with Stripe
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "@shared/utils/logger";
import Stripe from "stripe";

// ============================================
// TYPES & INTERFACES
// ============================================

export type SubscriptionPlan = "trial" | "basic" | "premium" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export interface PricingConfig {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  priceId: string;
  amount: number;
  currency: string;
  features: string[];
}

export interface SubscriptionInfo {
  id: string;
  tenantId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  metadata: Record<string, any>;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: Date;
  dueDate?: Date;
  hostedInvoiceUrl: string;
  metadata: Record<string, any>;
}

// ============================================
// STRIPE PRICING CONFIGURATION
// ============================================

const STRIPE_PRICE_IDS: Record<
  SubscriptionPlan,
  Record<BillingCycle, string>
> = {
  trial: {
    monthly: "", // Trial doesn't have Stripe prices
    yearly: "",
  },
  basic: {
    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || "price_basic_monthly",
    yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID || "price_basic_yearly",
  },
  premium: {
    monthly:
      process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "price_premium_monthly",
    yearly:
      process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "price_premium_yearly",
  },
  enterprise: {
    monthly:
      process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ||
      "price_enterprise_monthly",
    yearly:
      process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID ||
      "price_enterprise_yearly",
  },
};

const PRICING_CONFIG: PricingConfig[] = [
  {
    plan: "basic",
    cycle: "monthly",
    priceId: STRIPE_PRICE_IDS.basic.monthly,
    amount: 2900, // $29.00
    currency: "usd",
    features: [
      "1,000 voice calls",
      "API access",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    plan: "basic",
    cycle: "yearly",
    priceId: STRIPE_PRICE_IDS.basic.yearly,
    amount: 29000, // $290.00 (2 months free)
    currency: "usd",
    features: [
      "1,000 voice calls",
      "API access",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    plan: "premium",
    cycle: "monthly",
    priceId: STRIPE_PRICE_IDS.premium.monthly,
    amount: 9900, // $99.00
    currency: "usd",
    features: [
      "10,000 voice calls",
      "Voice cloning",
      "Advanced analytics",
      "Multi-location",
      "Priority support",
    ],
  },
  {
    plan: "premium",
    cycle: "yearly",
    priceId: STRIPE_PRICE_IDS.premium.yearly,
    amount: 99000, // $990.00 (2 months free)
    currency: "usd",
    features: [
      "10,000 voice calls",
      "Voice cloning",
      "Advanced analytics",
      "Multi-location",
      "Priority support",
    ],
  },
  {
    plan: "enterprise",
    cycle: "monthly",
    priceId: STRIPE_PRICE_IDS.enterprise.monthly,
    amount: 29900, // $299.00
    currency: "usd",
    features: [
      "100,000 voice calls",
      "White label",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
  },
  {
    plan: "enterprise",
    cycle: "yearly",
    priceId: STRIPE_PRICE_IDS.enterprise.yearly,
    amount: 299000, // $2,990.00 (2 months free)
    currency: "usd",
    features: [
      "100,000 voice calls",
      "White label",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
  },
];

// ============================================
// STRIPE SERVICE
// ============================================

export class StripeService {
  private stripe: Stripe;
  private prisma: PrismaClient;

  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    });

    this.prisma = new PrismaClient();

    logger.info("[StripeService] Initialized with Stripe API");
  }

  // ============================================
  // CUSTOMER MANAGEMENT
  // ============================================

  /**
   * Create or get Stripe customer for tenant
   */
  async getOrCreateCustomer(
    tenantId: string,
    customerData: {
      email?: string;
      name?: string;
      metadata?: Record<string, string>;
    },
  ): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists
      const existingCustomer = await this.getCustomerByTenantId(tenantId);
      if (existingCustomer) {
        return existingCustomer;
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: {
          tenantId,
          ...customerData.metadata,
        },
      });

      // Save customer ID to database
      await this.saveCustomerMapping(tenantId, customer.id);

      logger.info("[StripeService] Created new customer", {
        tenantId,
        customerId: customer.id,
      });

      return customer;
    } catch (error: any) {
      logger.error("[StripeService] Error creating customer", error);
      throw error;
    }
  }

  /**
   * Get Stripe customer by tenant ID
   */
  private async getCustomerByTenantId(
    tenantId: string,
  ): Promise<Stripe.Customer | null> {
    try {
      // Get customer ID from database
      const mapping = await this.getCustomerMapping(tenantId);
      if (!mapping) {
        return null;
      }

      const customer = await this.stripe.customers.retrieve(
        mapping.stripeCustomerId,
      );

      if (customer.deleted) {
        return null;
      }

      return customer as Stripe.Customer;
    } catch (error: any) {
      logger.error("[StripeService] Error getting customer", error);
      return null;
    }
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Create new subscription
   */
  async createSubscription(
    tenantId: string,
    plan: SubscriptionPlan,
    cycle: BillingCycle,
    paymentMethodId?: string,
  ): Promise<Stripe.Subscription> {
    try {
      if (plan === "trial") {
        throw new Error("Cannot create Stripe subscription for trial plan");
      }

      const priceId = STRIPE_PRICE_IDS[plan][cycle];
      if (!priceId) {
        throw new Error(`Invalid plan/cycle combination: ${plan}/${cycle}`);
      }

      // Get or create customer
      const customer = await this.getOrCreateCustomer(tenantId, {
        metadata: { plan, cycle },
      });

      // Create subscription
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customer.id,
        items: [{ price: priceId }],
        metadata: {
          tenantId,
          plan,
          cycle,
        },
        expand: ["latest_invoice.payment_intent"],
      };

      // Add payment method if provided
      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      // Add trial period for first-time subscribers
      const isFirstSubscription = await this.isFirstSubscription(tenantId);
      if (isFirstSubscription) {
        subscriptionData.trial_period_days = 14; // 14-day trial
      }

      const subscription =
        await this.stripe.subscriptions.create(subscriptionData);

      // Save subscription mapping
      await this.saveSubscriptionMapping(tenantId, subscription.id);

      logger.info("[StripeService] Created subscription", {
        tenantId,
        subscriptionId: subscription.id,
        plan,
        cycle,
      });

      return subscription;
    } catch (error: any) {
      logger.error("[StripeService] Error creating subscription", error);
      throw error;
    }
  }

  /**
   * Update existing subscription
   */
  async updateSubscription(
    tenantId: string,
    newPlan: SubscriptionPlan,
    newCycle: BillingCycle,
    isUpgrade: boolean = true,
  ): Promise<Stripe.Subscription> {
    try {
      if (newPlan === "trial") {
        throw new Error("Cannot update to trial plan");
      }

      const newPriceId = STRIPE_PRICE_IDS[newPlan][newCycle];
      if (!newPriceId) {
        throw new Error(
          `Invalid plan/cycle combination: ${newPlan}/${newCycle}`,
        );
      }

      // Get existing subscription
      const subscriptionMapping = await this.getSubscriptionMapping(tenantId);
      if (!subscriptionMapping) {
        throw new Error("No existing subscription found");
      }

      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionMapping.stripeSubscriptionId,
      );

      // Update subscription
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscription.id,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          metadata: {
            ...subscription.metadata,
            plan: newPlan,
            cycle: newCycle,
          },
          proration_behavior: isUpgrade ? "create_prorations" : "none",
          billing_cycle_anchor: isUpgrade ? "now" : "unchanged",
        },
      );

      logger.info("[StripeService] Updated subscription", {
        tenantId,
        subscriptionId: subscription.id,
        newPlan,
        newCycle,
        isUpgrade,
      });

      return updatedSubscription;
    } catch (error: any) {
      logger.error("[StripeService] Error updating subscription", error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    tenantId: string,
    reason?: string,
  ): Promise<Stripe.Subscription> {
    try {
      const subscriptionMapping = await this.getSubscriptionMapping(tenantId);
      if (!subscriptionMapping) {
        throw new Error("No subscription found to cancel");
      }

      const subscription = await this.stripe.subscriptions.update(
        subscriptionMapping.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
          metadata: {
            ...subscription.metadata,
            cancellation_reason: reason || "User requested",
            cancelled_at: new Date().toISOString(),
          },
        },
      );

      logger.info("[StripeService] Cancelled subscription", {
        tenantId,
        subscriptionId: subscription.id,
        reason,
      });

      return subscription;
    } catch (error: any) {
      logger.error("[StripeService] Error cancelling subscription", error);
      throw error;
    }
  }

  /**
   * Immediately cancel subscription
   */
  async cancelSubscriptionImmediately(
    tenantId: string,
    reason?: string,
  ): Promise<Stripe.Subscription> {
    try {
      const subscriptionMapping = await this.getSubscriptionMapping(tenantId);
      if (!subscriptionMapping) {
        throw new Error("No subscription found to cancel");
      }

      const subscription = await this.stripe.subscriptions.cancel(
        subscriptionMapping.stripeSubscriptionId,
        {
          prorate: true,
        },
      );

      logger.info("[StripeService] Immediately cancelled subscription", {
        tenantId,
        subscriptionId: subscription.id,
        reason,
      });

      return subscription;
    } catch (error: any) {
      logger.error(
        "[StripeService] Error immediately cancelling subscription",
        error,
      );
      throw error;
    }
  }

  // ============================================
  // PAYMENT PROCESSING
  // ============================================

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    tenantId: string,
    amount: number,
    currency: string = "usd",
    description?: string,
    metadata?: Record<string, string>,
  ): Promise<PaymentIntent> {
    try {
      const customer = await this.getOrCreateCustomer(tenantId, {});

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customer.id,
        description,
        metadata: {
          tenantId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info("[StripeService] Created payment intent", {
        tenantId,
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret!,
        metadata: paymentIntent.metadata,
      };
    } catch (error: any) {
      logger.error("[StripeService] Error creating payment intent", error);
      throw error;
    }
  }

  /**
   * Process payment
   */
  async processPayment(
    tenantId: string,
    amount: number,
    currency: string,
    paymentMethodId: string,
    description?: string,
  ): Promise<PaymentIntent> {
    try {
      const customer = await this.getOrCreateCustomer(tenantId, {});

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customer.id,
        payment_method: paymentMethodId,
        description,
        metadata: {
          tenantId,
        },
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/billing/payment-success`,
      });

      logger.info("[StripeService] Processed payment", {
        tenantId,
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret || "",
        metadata: paymentIntent.metadata,
      };
    } catch (error: any) {
      logger.error("[StripeService] Error processing payment", error);
      throw error;
    }
  }

  // ============================================
  // INVOICE MANAGEMENT
  // ============================================

  /**
   * Get invoices for tenant
   */
  async getInvoices(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<Invoice[]> {
    try {
      const customer = await this.getCustomerByTenantId(tenantId);
      if (!customer) {
        return [];
      }

      const invoices = await this.stripe.invoices.list({
        customer: customer.id,
        limit,
        starting_after:
          page > 1 ? await this.getLastInvoiceId(tenantId, page) : undefined,
      });

      const formattedInvoices: Invoice[] = invoices.data.map((invoice) => ({
        id: invoice.id,
        number: invoice.number || invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status || "unknown",
        paidAt: invoice.status_transitions.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : undefined,
        dueDate: invoice.due_date
          ? new Date(invoice.due_date * 1000)
          : undefined,
        hostedInvoiceUrl: invoice.hosted_invoice_url || "",
        metadata: invoice.metadata,
      }));

      return formattedInvoices;
    } catch (error: any) {
      logger.error("[StripeService] Error getting invoices", error);
      throw error;
    }
  }

  // ============================================
  // WEBHOOK HANDLING
  // ============================================

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(body: string | Buffer, signature: string): Promise<void> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET not configured");
      }

      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );

      logger.info("[StripeService] Received webhook event", {
        type: event.type,
        id: event.id,
      });

      switch (event.type) {
        case "subscription.created":
          await this.handleSubscriptionCreated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "subscription.updated":
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "subscription.deleted":
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice,
          );
          break;

        case "customer.subscription.trial_will_end":
          await this.handleTrialWillEnd(
            event.data.object as Stripe.Subscription,
          );
          break;

        default:
          logger.debug("[StripeService] Unhandled webhook event type", {
            type: event.type,
          });
      }
    } catch (error: any) {
      logger.error("[StripeService] Webhook handling error", error);
      throw error;
    }
  }

  // ============================================
  // WEBHOOK EVENT HANDLERS
  // ============================================

  private async handleSubscriptionCreated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    logger.info("[StripeService] Subscription created webhook", {
      tenantId,
      subscriptionId: subscription.id,
    });

    // Update tenant subscription status
    await this.updateTenantSubscriptionStatus(tenantId, "active");
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    logger.info("[StripeService] Subscription updated webhook", {
      tenantId,
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    // Update tenant subscription status
    await this.updateTenantSubscriptionStatus(tenantId, subscription.status);
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    logger.info("[StripeService] Subscription deleted webhook", {
      tenantId,
      subscriptionId: subscription.id,
    });

    // Update tenant subscription status
    await this.updateTenantSubscriptionStatus(tenantId, "cancelled");
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const subscription = invoice.subscription as string;
    const tenantId = invoice.metadata?.tenantId;

    logger.info("[StripeService] Invoice payment succeeded", {
      tenantId,
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
    });

    // Update payment status, send confirmation emails, etc.
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const tenantId = invoice.metadata?.tenantId;

    logger.warn("[StripeService] Invoice payment failed", {
      tenantId,
      invoiceId: invoice.id,
      amount: invoice.amount_due,
    });

    // Handle failed payment - send notifications, update status, etc.
  }

  private async handleTrialWillEnd(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    logger.info("[StripeService] Trial will end notification", {
      tenantId,
      subscriptionId: subscription.id,
      trialEnd: subscription.trial_end,
    });

    // Send trial ending notifications
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get pricing configuration
   */
  getPricingConfig(): PricingConfig[] {
    return PRICING_CONFIG;
  }

  /**
   * Get price for plan and cycle
   */
  getPrice(plan: SubscriptionPlan, cycle: BillingCycle): PricingConfig | null {
    return (
      PRICING_CONFIG.find(
        (config) => config.plan === plan && config.cycle === cycle,
      ) || null
    );
  }

  // ============================================
  // DATABASE OPERATIONS
  // ============================================

  private async saveCustomerMapping(
    tenantId: string,
    stripeCustomerId: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO stripe_customers (tenant_id, stripe_customer_id, created_at)
      VALUES (${tenantId}, ${stripeCustomerId}, ${new Date()})
      ON CONFLICT (tenant_id) DO UPDATE SET 
        stripe_customer_id = ${stripeCustomerId},
        updated_at = ${new Date()}
    `;
  }

  private async getCustomerMapping(
    tenantId: string,
  ): Promise<{ stripeCustomerId: string } | null> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT stripe_customer_id 
      FROM stripe_customers 
      WHERE tenant_id = ${tenantId}
    `;

    return result[0]
      ? { stripeCustomerId: result[0].stripe_customer_id }
      : null;
  }

  private async saveSubscriptionMapping(
    tenantId: string,
    stripeSubscriptionId: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO stripe_subscriptions (tenant_id, stripe_subscription_id, created_at)
      VALUES (${tenantId}, ${stripeSubscriptionId}, ${new Date()})
      ON CONFLICT (tenant_id) DO UPDATE SET 
        stripe_subscription_id = ${stripeSubscriptionId},
        updated_at = ${new Date()}
    `;
  }

  private async getSubscriptionMapping(
    tenantId: string,
  ): Promise<{ stripeSubscriptionId: string } | null> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT stripe_subscription_id 
      FROM stripe_subscriptions 
      WHERE tenant_id = ${tenantId}
    `;

    return result[0]
      ? { stripeSubscriptionId: result[0].stripe_subscription_id }
      : null;
  }

  private async isFirstSubscription(tenantId: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as subscription_count
      FROM stripe_subscriptions 
      WHERE tenant_id = ${tenantId}
    `;

    return parseInt(result[0]?.subscription_count) === 0;
  }

  private async updateTenantSubscriptionStatus(
    tenantId: string,
    status: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE tenants 
      SET subscription_status = ${status}, updated_at = ${new Date()}
      WHERE id = ${tenantId}
    `;
  }

  private async getLastInvoiceId(
    tenantId: string,
    page: number,
  ): Promise<string | undefined> {
    // Implementation for pagination cursor
    return undefined;
  }

  // ============================================
  // CLEANUP
  // ============================================

  async shutdown(): Promise<void> {
    logger.info("[StripeService] Shutting down...");
    await this.prisma.$disconnect();
    logger.info("[StripeService] Shutdown complete");
  }
}
