// ============================================
// PRODUCTION EMAIL SERVICE
// ============================================
// Real email service integration for verification and password reset

import nodemailer from "nodemailer";

interface EmailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    email: string;
    name: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  template:
    | "email-verification"
    | "password-reset"
    | "security-alert"
    | "welcome";
  data: Record<string, any>;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static config: EmailServiceConfig | null = null;

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize email service with configuration
   */
  static async initialize(): Promise<void> {
    try {
      this.config = {
        host: process.env.SMTP_HOST || "localhost",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
        from: {
          email: process.env.FROM_EMAIL || "noreply@demohotel.com",
          name: process.env.FROM_NAME || "DemoHotel Authentication",
        },
      };

      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === "production",
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log("✅ [EmailService] SMTP connection verified successfully");
    } catch (error) {
      console.error("❌ [EmailService] Failed to initialize:", error);

      // In development, use console logging as fallback
      if (process.env.NODE_ENV !== "production") {
        console.log("📧 [EmailService] Using console fallback for development");
        this.transporter = null;
      } else {
        throw error;
      }
    }
  }

  // ============================================
  // EMAIL SENDING METHODS
  // ============================================

  /**
   * Send email verification
   */
  static async sendEmailVerification(
    email: string,
    token: string,
    displayName: string,
  ): Promise<boolean> {
    const verificationUrl = `${this.getBaseUrl()}/verify-email?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: "Verify your email address",
      template: "email-verification",
      data: {
        displayName,
        verificationUrl,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(
    email: string,
    token: string,
    displayName: string,
  ): Promise<boolean> {
    const resetUrl = `${this.getBaseUrl()}/reset-password?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: "Reset your password",
      template: "password-reset",
      data: {
        displayName,
        resetUrl,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }

  /**
   * Send security alert email
   */
  static async sendSecurityAlert(
    email: string,
    alertType: string,
    details: {
      ipAddress: string;
      location?: string;
      timestamp: string;
      action?: string;
    },
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Security Alert: ${alertType}`,
      template: "security-alert",
      data: {
        alertType,
        ...details,
        dashboardUrl: `${this.getBaseUrl()}/dashboard`,
      },
    });
  }

  /**
   * Send welcome email after successful registration
   */
  static async sendWelcomeEmail(
    email: string,
    displayName: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: "Welcome to DemoHotel!",
      template: "welcome",
      data: {
        displayName,
        dashboardUrl: `${this.getBaseUrl()}/dashboard`,
        supportUrl: `${this.getBaseUrl()}/support`,
      },
    });
  }

  // ============================================
  // CORE EMAIL SENDING
  // ============================================

  /**
   * Send email with template
   */
  private static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.config) {
        await this.initialize();
      }

      // Generate email content
      const { html, text } = this.generateEmailContent(
        options.template,
        options.data,
      );

      if (!this.transporter) {
        // Development fallback - log to console
        this.logEmailToConsole(options, html);
        return true;
      }

      // Send actual email
      const mailOptions = {
        from: `"${this.config!.from.name}" <${this.config!.from.email}>`,
        to: options.to,
        subject: options.subject,
        text,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(
        `✅ [EmailService] Email sent successfully to ${options.to}:`,
        result.messageId,
      );
      return true;
    } catch (error) {
      console.error(
        `❌ [EmailService] Failed to send email to ${options.to}:`,
        error,
      );

      // Log email content for debugging
      const { html } = this.generateEmailContent(
        options.template,
        options.data,
      );
      this.logEmailToConsole(options, html);

      return false;
    }
  }

  // ============================================
  // EMAIL TEMPLATES
  // ============================================

  /**
   * Generate email content from template
   */
  private static generateEmailContent(
    template: string,
    data: Record<string, any>,
  ): { html: string; text: string } {
    switch (template) {
      case "email-verification":
        return this.generateEmailVerificationTemplate(data);
      case "password-reset":
        return this.generatePasswordResetTemplate(data);
      case "security-alert":
        return this.generateSecurityAlertTemplate(data);
      case "welcome":
        return this.generateWelcomeTemplate(data);
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
  }

  /**
   * Email verification template
   */
  private static generateEmailVerificationTemplate(data: any): {
    html: string;
    text: string;
  } {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email Address</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .code { background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Email Verification Required</h1>
        </div>
        <div class="content">
            <h2>Hello ${data.displayName}!</h2>
            <p>Thank you for registering with DemoHotel. To complete your registration and secure your account, please verify your email address.</p>
            
            <p><a href="${data.verificationUrl}" class="button">Verify Email Address</a></p>
            
            <p>Or copy and paste this verification code:</p>
            <div class="code">${data.token}</div>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>DemoHotel Authentication System</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Email Verification Required

Hello ${data.displayName}!

Thank you for registering with DemoHotel. To complete your registration and secure your account, please verify your email address.

Verification URL: ${data.verificationUrl}

Or use this verification code: ${data.token}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

---
DemoHotel Authentication System
This is an automated message, please do not reply.
`;

    return { html, text };
  }

  /**
   * Password reset template
   */
  private static generatePasswordResetTemplate(data: any): {
    html: string;
    text: string;
  } {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello ${data.displayName}!</h2>
            <p>We received a request to reset your password for your DemoHotel account.</p>
            
            <p><a href="${data.resetUrl}" class="button">Reset Password</a></p>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This link will expire in 24 hours.<br>
                If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>For security reasons, this reset token can only be used once.</p>
        </div>
        <div class="footer">
            <p>DemoHotel Authentication System</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Password Reset Request

Hello ${data.displayName}!

We received a request to reset your password for your DemoHotel account.

Reset URL: ${data.resetUrl}

SECURITY NOTICE:
- This link will expire in 24 hours
- If you didn't request this password reset, please ignore this email
- This reset token can only be used once

---
DemoHotel Authentication System
This is an automated message, please do not reply.
`;

    return { html, text };
  }

  /**
   * Security alert template
   */
  private static generateSecurityAlertTemplate(data: any): {
    html: string;
    text: string;
  } {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Security Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Security Alert</h1>
        </div>
        <div class="content">
            <div class="alert">
                <strong>Alert Type:</strong> ${data.alertType}<br>
                <strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}<br>
                <strong>IP Address:</strong> ${data.ipAddress}<br>
                ${data.location ? `<strong>Location:</strong> ${data.location}<br>` : ""}
                ${data.action ? `<strong>Action:</strong> ${data.action}<br>` : ""}
            </div>
            
            <p>We detected potentially suspicious activity on your account. If this was you, no action is needed.</p>
            
            <p>If you don't recognize this activity:</p>
            <ul>
                <li>Change your password immediately</li>
                <li>Review your recent account activity</li>
                <li>Enable two-factor authentication if available</li>
            </ul>
            
            <p><a href="${data.dashboardUrl}" class="button">Review Account Activity</a></p>
        </div>
        <div class="footer">
            <p>DemoHotel Security Team</p>
            <p>This is an automated security alert.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Security Alert

Alert Type: ${data.alertType}
Time: ${new Date(data.timestamp).toLocaleString()}
IP Address: ${data.ipAddress}
${data.location ? `Location: ${data.location}\n` : ""}
${data.action ? `Action: ${data.action}\n` : ""}

We detected potentially suspicious activity on your account. If this was you, no action is needed.

If you don't recognize this activity:
- Change your password immediately
- Review your recent account activity  
- Enable two-factor authentication if available

Dashboard: ${data.dashboardUrl}

---
DemoHotel Security Team
This is an automated security alert.
`;

    return { html, text };
  }

  /**
   * Welcome email template
   */
  private static generateWelcomeTemplate(data: any): {
    html: string;
    text: string;
  } {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to DemoHotel!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to DemoHotel!</h1>
        </div>
        <div class="content">
            <h2>Hello ${data.displayName}!</h2>
            <p>Welcome to DemoHotel! Your account has been successfully created and verified.</p>
            
            <div class="features">
                <h3>🚀 Get Started:</h3>
                <ul>
                    <li>✅ Access your dashboard</li>
                    <li>✅ Manage hotel operations</li>
                    <li>✅ Use voice assistant features</li>
                    <li>✅ Monitor analytics</li>
                </ul>
            </div>
            
            <p><a href="${data.dashboardUrl}" class="button">Go to Dashboard</a></p>
            
            <p>If you have any questions, our support team is here to help!</p>
            <p><a href="${data.supportUrl}">Contact Support</a></p>
        </div>
        <div class="footer">
            <p>DemoHotel Team</p>
            <p>Thank you for choosing DemoHotel!</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Welcome to DemoHotel!

Hello ${data.displayName}!

Welcome to DemoHotel! Your account has been successfully created and verified.

Get Started:
✅ Access your dashboard
✅ Manage hotel operations  
✅ Use voice assistant features
✅ Monitor analytics

Dashboard: ${data.dashboardUrl}
Support: ${data.supportUrl}

If you have any questions, our support team is here to help!

---
DemoHotel Team
Thank you for choosing DemoHotel!
`;

    return { html, text };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Log email to console (development fallback)
   */
  private static logEmailToConsole(options: EmailOptions, html: string): void {
    console.log("\n📧 [EmailService] Email Content (Console Mode):");
    console.log("─".repeat(80));
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Template: ${options.template}`);
    console.log("─".repeat(80));
    console.log(html);
    console.log("─".repeat(80));
  }

  /**
   * Get base URL for links
   */
  private static getBaseUrl(): string {
    return (
      process.env.BASE_URL || process.env.CLIENT_URL || "http://localhost:3000"
    );
  }

  /**
   * Get email service health status
   */
  static async getHealthStatus(): Promise<{
    status: "healthy" | "unhealthy";
    transporter: boolean;
    config: boolean;
    lastError?: string;
  }> {
    try {
      if (!this.config) {
        await this.initialize();
      }

      if (!this.transporter) {
        return {
          status: "unhealthy",
          transporter: false,
          config: !!this.config,
          lastError: "No transporter available",
        };
      }

      await this.transporter.verify();

      return {
        status: "healthy",
        transporter: true,
        config: !!this.config,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        transporter: !!this.transporter,
        config: !!this.config,
        lastError: String(error),
      };
    }
  }
}
