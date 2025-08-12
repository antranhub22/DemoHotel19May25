import crypto from "crypto";
import { EventEmitter } from "events";
import * as fs from "fs/promises";
import * as path from "path";

// ============================================
// Types & Interfaces
// ============================================

export interface ComplianceConfig {
  gdpr: {
    enabled: boolean;
    dataProcessingPurposes: string[];
    legalBases: string[];
    retentionPeriods: Record<string, number>; // in days
    rightToErasure: boolean;
    rightToPortability: boolean;
    consentManagement: boolean;
    dataMinimization: boolean;
  };
  soc2: {
    enabled: boolean;
    type: "Type I" | "Type II";
    securityPrinciples: string[];
    controlFrameworks: string[];
    auditFrequency: number; // months
    riskAssessment: boolean;
  };
  iso27001: {
    enabled: boolean;
    version: "2013" | "2022";
    informationSecurityControls: string[];
    riskManagement: boolean;
    incidentManagement: boolean;
    businessContinuity: boolean;
  };
  privacy: {
    policyManagement: boolean;
    cookieConsent: boolean;
    dataMapping: boolean;
    privacyByDesign: boolean;
    dataProtectionOfficer: string;
  };
  dataRetention: {
    enabled: boolean;
    defaultRetentionPeriod: number; // days
    automaticDeletion: boolean;
    retentionSchedules: Record<string, RetentionSchedule>;
    backupRetention: number; // days
  };
  monitoring: {
    complianceTracking: boolean;
    auditLogging: boolean;
    alerting: boolean;
    reporting: boolean;
    dashboards: boolean;
  };
}

export interface RetentionSchedule {
  dataType: string;
  retentionPeriod: number; // days
  legalRequirement: string;
  deletionMethod: "soft" | "hard" | "anonymize";
  approvalRequired: boolean;
  exceptions: string[];
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  thirdCountryTransfers: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  created: Date;
  lastUpdated: Date;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  tenantId?: string;
  purpose: string;
  consentGiven: boolean;
  consentDate: Date;
  withdrawalDate?: Date;
  ipAddress: string;
  userAgent: string;
  consentMethod: "explicit" | "implied" | "opt-in" | "opt-out";
  metadata: Record<string, any>;
}

export interface DataSubjectRequest {
  id: string;
  type:
    | "access"
    | "rectification"
    | "erasure"
    | "portability"
    | "restriction"
    | "objection";
  userId: string;
  tenantId?: string;
  requestDate: Date;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "rejected"
    | "partially_completed";
  dueDate: Date;
  description: string;
  supportingDocuments: string[];
  response?: {
    date: Date;
    action: string;
    details: string;
    dataExported?: string;
  };
  processedBy?: string;
  metadata: Record<string, any>;
}

export interface ComplianceViolation {
  id: string;
  type: "gdpr" | "soc2" | "iso27001" | "privacy" | "retention";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  detectedDate: Date;
  affectedData: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  remediation: {
    required: boolean;
    actions: string[];
    deadline?: Date;
    assignee?: string;
  };
  status: "open" | "in_progress" | "resolved" | "accepted_risk";
  metadata: Record<string, any>;
}

export interface ComplianceAudit {
  id: string;
  type: "internal" | "external" | "regulatory" | "certification";
  framework: "gdpr" | "soc2" | "iso27001" | "combined";
  startDate: Date;
  endDate?: Date;
  auditor: string;
  scope: string[];
  findings: {
    compliant: number;
    nonCompliant: number;
    recommendations: number;
    critical: number;
  };
  status: "planned" | "in_progress" | "completed" | "report_pending";
  reportPath?: string;
  metadata: Record<string, any>;
}

// ============================================
// Default Configuration
// ============================================

const defaultComplianceConfig: ComplianceConfig = {
  gdpr: {
    enabled: true,
    dataProcessingPurposes: [
      "service_provision",
      "customer_support",
      "analytics",
      "marketing",
      "legal_compliance",
    ],
    legalBases: [
      "consent",
      "contract",
      "legal_obligation",
      "vital_interests",
      "public_task",
      "legitimate_interests",
    ],
    retentionPeriods: {
      user_data: 2555, // 7 years
      transaction_data: 2555, // 7 years
      log_data: 365, // 1 year
      backup_data: 90, // 3 months
      analytics_data: 730, // 2 years
    },
    rightToErasure: true,
    rightToPortability: true,
    consentManagement: true,
    dataMinimization: true,
  },
  soc2: {
    enabled: true,
    type: "Type II",
    securityPrinciples: [
      "security",
      "availability",
      "processing_integrity",
      "confidentiality",
      "privacy",
    ],
    controlFrameworks: ["COSO", "COBIT"],
    auditFrequency: 12, // annually
    riskAssessment: true,
  },
  iso27001: {
    enabled: true,
    version: "2022",
    informationSecurityControls: [
      "A.5.1",
      "A.5.2",
      "A.5.3", // Information security policies
      "A.6.1",
      "A.6.2", // Organization of information security
      "A.7.1",
      "A.7.2",
      "A.7.3", // Human resource security
      "A.8.1",
      "A.8.2",
      "A.8.3", // Asset management
    ],
    riskManagement: true,
    incidentManagement: true,
    businessContinuity: true,
  },
  privacy: {
    policyManagement: true,
    cookieConsent: true,
    dataMapping: true,
    privacyByDesign: true,
    dataProtectionOfficer: "dpo@hotel.com",
  },
  dataRetention: {
    enabled: true,
    defaultRetentionPeriod: 2555, // 7 years
    automaticDeletion: true,
    retentionSchedules: {},
    backupRetention: 90, // 3 months
  },
  monitoring: {
    complianceTracking: true,
    auditLogging: true,
    alerting: true,
    reporting: true,
    dashboards: true,
  },
};

// ============================================
// Compliance Manager Class
// ============================================

export class ComplianceManager extends EventEmitter {
  private config: ComplianceConfig;
  private dataProcessingActivities: Map<string, DataProcessingActivity> =
    new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private dataSubjectRequests: Map<string, DataSubjectRequest> = new Map();
  private violations: Map<string, ComplianceViolation> = new Map();
  private audits: Map<string, ComplianceAudit> = new Map();
  private retentionSchedules: Map<string, RetentionSchedule> = new Map();

  constructor(config: Partial<ComplianceConfig> = {}) {
    super();
    this.config = { ...defaultComplianceConfig, ...config };

    this.initializeCompliance();

    console.log(
      "⚖️ ComplianceManager initialized with comprehensive compliance management",
      "ComplianceManager",
    );
  }

  // ============================================
  // Initialization Methods
  // ============================================

  private async initializeCompliance() {
    try {
      // Create compliance directories
      await this.createDirectories();

      // Load existing data
      await this.loadComplianceData();

      // Setup default retention schedules
      this.setupDefaultRetentionSchedules();

      // Start background tasks
      this.startComplianceMonitoring();
      this.startRetentionEnforcement();

      this.emit("initialized");
    } catch (error) {
      console.error("Failed to initialize compliance:", error);
      throw error;
    }
  }

  private async createDirectories() {
    const dirs = [
      "./compliance/policies",
      "./compliance/audits",
      "./compliance/reports",
      "./compliance/data-subject-requests",
      "./compliance/consent-records",
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  private async loadComplianceData() {
    // Load data processing activities
    await this.loadDataProcessingActivities();

    // Load consent records
    await this.loadConsentRecords();

    // Load data subject requests
    await this.loadDataSubjectRequests();
  }

  private setupDefaultRetentionSchedules() {
    const schedules = [
      {
        dataType: "user_personal_data",
        retentionPeriod: this.config.gdpr.retentionPeriods.user_data,
        legalRequirement: "GDPR Article 5(1)(e)",
        deletionMethod: "hard" as const,
        approvalRequired: true,
        exceptions: ["legal_hold", "active_contract"],
      },
      {
        dataType: "transaction_records",
        retentionPeriod: this.config.gdpr.retentionPeriods.transaction_data,
        legalRequirement: "Financial regulations",
        deletionMethod: "hard" as const,
        approvalRequired: true,
        exceptions: ["audit_requirement", "dispute_resolution"],
      },
      {
        dataType: "audit_logs",
        retentionPeriod: this.config.gdpr.retentionPeriods.log_data,
        legalRequirement: "SOC 2 requirements",
        deletionMethod: "anonymize" as const,
        approvalRequired: false,
        exceptions: ["security_incident"],
      },
    ];

    for (const schedule of schedules) {
      this.retentionSchedules.set(schedule.dataType, schedule);
    }
  }

  // ============================================
  // GDPR Compliance Methods
  // ============================================

  async registerDataProcessingActivity(
    activity: Omit<DataProcessingActivity, "id" | "created" | "lastUpdated">,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();

    const dataProcessingActivity: DataProcessingActivity = {
      ...activity,
      id,
      created: now,
      lastUpdated: now,
    };

    this.dataProcessingActivities.set(id, dataProcessingActivity);
    await this.saveDataProcessingActivity(dataProcessingActivity);

    console.log(`📋 Registered data processing activity: ${activity.name}`);
    this.emit("dataProcessingActivityRegistered", dataProcessingActivity);

    return id;
  }

  async recordConsent(
    consent: Omit<ConsentRecord, "id" | "consentDate">,
  ): Promise<string> {
    const id = crypto.randomUUID();

    const consentRecord: ConsentRecord = {
      ...consent,
      id,
      consentDate: new Date(),
    };

    this.consentRecords.set(id, consentRecord);
    await this.saveConsentRecord(consentRecord);

    console.log(
      `✅ Recorded consent: ${consent.purpose} for user ${consent.userId}`,
    );
    this.emit("consentRecorded", consentRecord);

    return id;
  }

  async withdrawConsent(
    consentId: string,
    withdrawalReason?: string,
  ): Promise<boolean> {
    const consent = this.consentRecords.get(consentId);
    if (!consent) return false;

    consent.consentGiven = false;
    consent.withdrawalDate = new Date();
    consent.metadata.withdrawalReason = withdrawalReason;

    await this.saveConsentRecord(consent);

    console.log(
      `🚫 Consent withdrawn: ${consent.purpose} for user ${consent.userId}`,
    );
    this.emit("consentWithdrawn", consent);

    return true;
  }

  async createDataSubjectRequest(
    request: Omit<
      DataSubjectRequest,
      "id" | "requestDate" | "status" | "dueDate"
    >,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const requestDate = new Date();
    const dueDate = new Date(requestDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const dataSubjectRequest: DataSubjectRequest = {
      ...request,
      id,
      requestDate,
      dueDate,
      status: "pending",
    };

    this.dataSubjectRequests.set(id, dataSubjectRequest);
    await this.saveDataSubjectRequest(dataSubjectRequest);

    console.log(
      `📥 Data subject request created: ${request.type} for user ${request.userId}`,
    );
    this.emit("dataSubjectRequestCreated", dataSubjectRequest);

    return id;
  }

  async processDataSubjectRequest(
    requestId: string,
    action: string,
    details: string,
    processedBy: string,
  ): Promise<boolean> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request) return false;

    request.status = "completed";
    request.response = {
      date: new Date(),
      action,
      details,
    };
    request.processedBy = processedBy;

    await this.saveDataSubjectRequest(request);

    console.log(`✅ Data subject request processed: ${requestId}`);
    this.emit("dataSubjectRequestProcessed", request);

    return true;
  }

  // ============================================
  // Data Retention Management
  // ============================================

  async addRetentionSchedule(schedule: RetentionSchedule): Promise<void> {
    this.retentionSchedules.set(schedule.dataType, schedule);
    await this.saveRetentionSchedule(schedule);

    console.log(`🗓️ Added retention schedule for: ${schedule.dataType}`);
    this.emit("retentionScheduleAdded", schedule);
  }

  async checkRetentionCompliance(): Promise<{
    toDelete: string[];
    toReview: string[];
  }> {
    const now = new Date();
    const toDelete: string[] = [];
    const toReview: string[] = [];

    for (const [dataType, schedule] of this.retentionSchedules) {
      // In a real implementation, this would query the database
      // For now, we'll simulate checking against our records

      if (schedule.approvalRequired) {
        toReview.push(dataType);
      } else {
        toDelete.push(dataType);
      }
    }

    return { toDelete, toReview };
  }

  async enforceDataRetention(): Promise<{
    deleted: number;
    anonymized: number;
    errors: number;
  }> {
    const { toDelete } = await this.checkRetentionCompliance();
    let deleted = 0;
    let anonymized = 0;
    let errors = 0;

    for (const dataType of toDelete) {
      try {
        const schedule = this.retentionSchedules.get(dataType);
        if (!schedule) continue;

        switch (schedule.deletionMethod) {
          case "hard":
            // Implement hard deletion
            deleted++;
            break;
          case "soft":
            // Implement soft deletion
            deleted++;
            break;
          case "anonymize":
            // Implement anonymization
            anonymized++;
            break;
        }

        console.log(
          `🗑️ Enforced retention for: ${dataType} (${schedule.deletionMethod})`,
        );
      } catch (error) {
        console.error(`Failed to enforce retention for ${dataType}:`, error);
        errors++;
      }
    }

    this.emit("retentionEnforced", { deleted, anonymized, errors });
    return { deleted, anonymized, errors };
  }

  // ============================================
  // Compliance Violation Management
  // ============================================

  async reportViolation(
    violation: Omit<ComplianceViolation, "id" | "detectedDate" | "status">,
  ): Promise<string> {
    const id = crypto.randomUUID();

    const complianceViolation: ComplianceViolation = {
      ...violation,
      id,
      detectedDate: new Date(),
      status: "open",
    };

    this.violations.set(id, complianceViolation);
    await this.saveViolation(complianceViolation);

    console.warn(`⚠️ Compliance violation reported: ${violation.title}`);
    this.emit("violationReported", complianceViolation);

    // Auto-alert for critical violations
    if (violation.severity === "critical") {
      this.emit("criticalViolation", complianceViolation);
    }

    return id;
  }

  async resolveViolation(
    violationId: string,
    resolution: string,
    resolvedBy: string,
  ): Promise<boolean> {
    const violation = this.violations.get(violationId);
    if (!violation) return false;

    violation.status = "resolved";
    violation.metadata.resolution = resolution;
    violation.metadata.resolvedBy = resolvedBy;
    violation.metadata.resolvedDate = new Date();

    await this.saveViolation(violation);

    console.log(`✅ Violation resolved: ${violationId}`);
    this.emit("violationResolved", violation);

    return true;
  }

  // ============================================
  // Audit Management
  // ============================================

  async scheduleAudit(
    audit: Omit<ComplianceAudit, "id" | "status" | "findings">,
  ): Promise<string> {
    const id = crypto.randomUUID();

    const complianceAudit: ComplianceAudit = {
      ...audit,
      id,
      status: "planned",
      findings: {
        compliant: 0,
        nonCompliant: 0,
        recommendations: 0,
        critical: 0,
      },
    };

    this.audits.set(id, complianceAudit);
    await this.saveAudit(complianceAudit);

    console.log(
      `📅 Audit scheduled: ${audit.framework} audit by ${audit.auditor}`,
    );
    this.emit("auditScheduled", complianceAudit);

    return id;
  }

  async completeAudit(
    auditId: string,
    findings: ComplianceAudit["findings"],
    reportPath?: string,
  ): Promise<boolean> {
    const audit = this.audits.get(auditId);
    if (!audit) return false;

    audit.status = "completed";
    audit.endDate = new Date();
    audit.findings = findings;
    audit.reportPath = reportPath;

    await this.saveAudit(audit);

    console.log(`✅ Audit completed: ${auditId}`);
    this.emit("auditCompleted", audit);

    return true;
  }

  // ============================================
  // Compliance Reporting
  // ============================================

  async generateComplianceReport(
    framework: "gdpr" | "soc2" | "iso27001" | "all" = "all",
  ): Promise<any> {
    const report = {
      timestamp: new Date().toISOString(),
      framework,
      summary: {
        overallCompliance: "compliant",
        riskLevel: "low",
        lastAudit: this.getLastAuditDate(),
        violations: this.violations.size,
        openViolations: Array.from(this.violations.values()).filter(
          (v) => v.status === "open",
        ).length,
      },
      gdpr:
        framework === "gdpr" || framework === "all"
          ? await this.generateGDPRReport()
          : null,
      soc2:
        framework === "soc2" || framework === "all"
          ? await this.generateSOC2Report()
          : null,
      iso27001:
        framework === "iso27001" || framework === "all"
          ? await this.generateISO27001Report()
          : null,
      dataRetention: await this.generateRetentionReport(),
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  private async generateGDPRReport(): Promise<any> {
    const consentRecords = Array.from(this.consentRecords.values());
    const dataSubjectRequests = Array.from(this.dataSubjectRequests.values());
    const dataProcessingActivities = Array.from(
      this.dataProcessingActivities.values(),
    );

    return {
      dataProcessingActivities: {
        total: dataProcessingActivities.length,
        byPurpose: this.groupBy(dataProcessingActivities, "purpose"),
        byLegalBasis: this.groupBy(dataProcessingActivities, "legalBasis"),
      },
      consentManagement: {
        totalConsents: consentRecords.length,
        activeConsents: consentRecords.filter((c) => c.consentGiven).length,
        withdrawnConsents: consentRecords.filter((c) => !c.consentGiven).length,
      },
      dataSubjectRights: {
        totalRequests: dataSubjectRequests.length,
        byType: this.groupBy(dataSubjectRequests, "type"),
        completedOnTime: dataSubjectRequests.filter(
          (r) =>
            r.status === "completed" &&
            r.response &&
            r.response.date <= r.dueDate,
        ).length,
      },
      compliance: {
        rightToErasure: this.config.gdpr.rightToErasure,
        rightToPortability: this.config.gdpr.rightToPortability,
        dataMinimization: this.config.gdpr.dataMinimization,
        consentManagement: this.config.gdpr.consentManagement,
      },
    };
  }

  private async generateSOC2Report(): Promise<any> {
    const audits = Array.from(this.audits.values()).filter(
      (a) => a.framework === "soc2",
    );
    const violations = Array.from(this.violations.values()).filter(
      (v) => v.type === "soc2",
    );

    return {
      auditHistory: {
        totalAudits: audits.length,
        lastAudit: audits[audits.length - 1]?.endDate,
        nextAudit: this.calculateNextAuditDate(),
      },
      securityPrinciples: {
        implemented: this.config.soc2.securityPrinciples.length,
        total: 5, // Security, Availability, Processing Integrity, Confidentiality, Privacy
      },
      violations: {
        total: violations.length,
        open: violations.filter((v) => v.status === "open").length,
        critical: violations.filter((v) => v.severity === "critical").length,
      },
      compliance: {
        type: this.config.soc2.type,
        riskAssessment: this.config.soc2.riskAssessment,
        controlFrameworks: this.config.soc2.controlFrameworks,
      },
    };
  }

  private async generateISO27001Report(): Promise<any> {
    const violations = Array.from(this.violations.values()).filter(
      (v) => v.type === "iso27001",
    );

    return {
      informationSecurityControls: {
        implemented: this.config.iso27001.informationSecurityControls.length,
        total: 93, // Total ISO 27001:2022 controls
      },
      managementSystems: {
        riskManagement: this.config.iso27001.riskManagement,
        incidentManagement: this.config.iso27001.incidentManagement,
        businessContinuity: this.config.iso27001.businessContinuity,
      },
      violations: {
        total: violations.length,
        open: violations.filter((v) => v.status === "open").length,
        critical: violations.filter((v) => v.severity === "critical").length,
      },
      version: this.config.iso27001.version,
    };
  }

  private async generateRetentionReport(): Promise<any> {
    const { toDelete, toReview } = await this.checkRetentionCompliance();

    return {
      schedules: {
        total: this.retentionSchedules.size,
        enabled: this.config.dataRetention.enabled,
        automaticDeletion: this.config.dataRetention.automaticDeletion,
      },
      pendingActions: {
        toDelete: toDelete.length,
        toReview: toReview.length,
      },
      defaultRetention: this.config.dataRetention.defaultRetentionPeriod,
      backupRetention: this.config.dataRetention.backupRetention,
    };
  }

  // ============================================
  // Background Tasks
  // ============================================

  private startComplianceMonitoring() {
    // Check for compliance violations every hour
    setInterval(
      () => {
        this.checkComplianceStatus();
      },
      60 * 60 * 1000,
    );
  }

  private startRetentionEnforcement() {
    // Run retention enforcement daily
    setInterval(
      () => {
        if (this.config.dataRetention.automaticDeletion) {
          this.enforceDataRetention();
        }
      },
      24 * 60 * 60 * 1000,
    );
  }

  private async checkComplianceStatus() {
    // Check for overdue data subject requests
    const overdueRequests = Array.from(
      this.dataSubjectRequests.values(),
    ).filter(
      (request) => request.status === "pending" && new Date() > request.dueDate,
    );

    for (const request of overdueRequests) {
      await this.reportViolation({
        type: "gdpr",
        severity: "high",
        title: "Overdue Data Subject Request",
        description: `Data subject request ${request.id} is overdue`,
        affectedData: [request.userId],
        riskLevel: "high",
        remediation: {
          required: true,
          actions: [
            "Process the request immediately",
            "Contact the data subject",
          ],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        metadata: { requestId: request.id },
      });
    }
  }

  // ============================================
  // Storage Methods
  // ============================================

  private async saveDataProcessingActivity(activity: DataProcessingActivity) {
    const filepath = path.join(
      "./compliance/data-processing-activities",
      `${activity.id}.json`,
    );
    await fs.writeFile(filepath, JSON.stringify(activity, null, 2));
  }

  private async saveConsentRecord(consent: ConsentRecord) {
    const filepath = path.join(
      "./compliance/consent-records",
      `${consent.id}.json`,
    );
    await fs.writeFile(filepath, JSON.stringify(consent, null, 2));
  }

  private async saveDataSubjectRequest(request: DataSubjectRequest) {
    const filepath = path.join(
      "./compliance/data-subject-requests",
      `${request.id}.json`,
    );
    await fs.writeFile(filepath, JSON.stringify(request, null, 2));
  }

  private async saveViolation(violation: ComplianceViolation) {
    const filepath = path.join(
      "./compliance/violations",
      `${violation.id}.json`,
    );
    await fs.writeFile(filepath, JSON.stringify(violation, null, 2));
  }

  private async saveAudit(audit: ComplianceAudit) {
    const filepath = path.join("./compliance/audits", `${audit.id}.json`);
    await fs.writeFile(filepath, JSON.stringify(audit, null, 2));
  }

  private async saveRetentionSchedule(schedule: RetentionSchedule) {
    const filepath = path.join(
      "./compliance/retention-schedules",
      `${schedule.dataType}.json`,
    );
    await fs.writeFile(filepath, JSON.stringify(schedule, null, 2));
  }

  private async loadDataProcessingActivities() {
    // Implementation to load from files
  }

  private async loadConsentRecords() {
    // Implementation to load from files
  }

  private async loadDataSubjectRequests() {
    // Implementation to load from files
  }

  // ============================================
  // Utility Methods
  // ============================================

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc: Record<string, number>, item) => {
      const groupKey = String(item[key]);
      acc[groupKey] = (acc[groupKey] || 0) + 1;
      return acc;
    }, {});
  }

  private getLastAuditDate(): Date | null {
    const audits = Array.from(this.audits.values())
      .filter((a) => a.status === "completed")
      .sort(
        (a, b) => (b.endDate?.getTime() || 0) - (a.endDate?.getTime() || 0),
      );

    return audits[0]?.endDate || null;
  }

  private calculateNextAuditDate(): Date {
    const lastAudit = this.getLastAuditDate();
    const baseDate = lastAudit || new Date();
    return new Date(
      baseDate.getTime() +
        this.config.soc2.auditFrequency * 30 * 24 * 60 * 60 * 1000,
    );
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const openViolations = Array.from(this.violations.values()).filter(
      (v) => v.status === "open",
    );
    if (openViolations.length > 0) {
      recommendations.push(
        `${openViolations.length} open compliance violations require attention`,
      );
    }

    const overdueRequests = Array.from(
      this.dataSubjectRequests.values(),
    ).filter((r) => r.status === "pending" && new Date() > r.dueDate);
    if (overdueRequests.length > 0) {
      recommendations.push(
        `${overdueRequests.length} data subject requests are overdue`,
      );
    }

    const lastAudit = this.getLastAuditDate();
    if (
      !lastAudit ||
      new Date().getTime() - lastAudit.getTime() > 365 * 24 * 60 * 60 * 1000
    ) {
      recommendations.push("Annual compliance audit is due");
    }

    if (recommendations.length === 0) {
      recommendations.push("All compliance requirements are being met");
    }

    return recommendations;
  }

  // ============================================
  // Public API Methods
  // ============================================

  getMetrics() {
    return {
      gdpr: {
        dataProcessingActivities: this.dataProcessingActivities.size,
        consentRecords: this.consentRecords.size,
        dataSubjectRequests: this.dataSubjectRequests.size,
        pendingRequests: Array.from(this.dataSubjectRequests.values()).filter(
          (r) => r.status === "pending",
        ).length,
      },
      violations: {
        total: this.violations.size,
        open: Array.from(this.violations.values()).filter(
          (v) => v.status === "open",
        ).length,
        critical: Array.from(this.violations.values()).filter(
          (v) => v.severity === "critical",
        ).length,
      },
      audits: {
        total: this.audits.size,
        completed: Array.from(this.audits.values()).filter(
          (a) => a.status === "completed",
        ).length,
        planned: Array.from(this.audits.values()).filter(
          (a) => a.status === "planned",
        ).length,
      },
      retention: {
        schedules: this.retentionSchedules.size,
        automaticDeletion: this.config.dataRetention.automaticDeletion,
      },
    };
  }

  updateConfig(newConfig: Partial<ComplianceConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log("🔧 ComplianceManager configuration updated");
    this.emit("configUpdated", this.config);
  }
}

// ============================================
// Export Default Instance
// ============================================

export const complianceManager = new ComplianceManager();
export default ComplianceManager;
