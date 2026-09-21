/**
 * The employee workspace's data shapes, mirroring the backend views in
 * `ledgera-backend/src/internal/*`.
 *
 * These are hand-written rather than generated because the backend already
 * derives them (`isOverdue`, `progressPct`, `ageDays` are computed at read time,
 * never stored). A generator would faithfully reproduce the database row and
 * miss the derived fields the screens actually render.
 */

// ─── Vocabulary ──────────────────────────────────────────────────────────

export const WORK_AREAS = [
    "product",
    "sales",
    "finance",
    "people",
    "security",
    "operations",
] as const;
export type WorkArea = (typeof WORK_AREAS)[number];

export const WORK_AREA_LABELS: Record<WorkArea, string> = {
    product: "Product & Engineering",
    sales: "Go-to-Market",
    finance: "Finance",
    people: "People",
    security: "Security & Compliance",
    operations: "Operations",
};

export const TASK_PRIORITIES = ["now", "normal", "later"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskStatus = "open" | "in_progress" | "done";
export type GoalStatus = "on_track" | "at_risk" | "off_track" | "done";

export const ANNOUNCEMENT_CATEGORIES = [
    "company",
    "product",
    "leadership",
    "security",
    "people",
] as const;
export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];

export const DOC_CATEGORIES = [
    "sop",
    "policy",
    "engineering",
    "playbook",
    "product",
    "finance",
] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

export const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
    sop: "SOP",
    policy: "Policy",
    engineering: "Engineering",
    playbook: "Playbook",
    product: "Product",
    finance: "Finance",
};

export const REQUEST_CATEGORIES = [
    "it_equipment",
    "software_access",
    "software_purchase",
    "expense_reimbursement",
    "corporate_card",
    "travel",
] as const;
export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export const REQUEST_CATEGORY_LABELS: Record<RequestCategory, string> = {
    it_equipment: "IT equipment",
    software_access: "Software access",
    software_purchase: "Software purchase",
    expense_reimbursement: "Expense reimbursement",
    corporate_card: "Corporate card",
    travel: "Travel",
};

/** Categories where the backend requires a positive amount. */
export const SPEND_REQUEST_CATEGORIES: readonly RequestCategory[] = [
    "software_purchase",
    "expense_reimbursement",
    "travel",
];

export type RequestStatus = "submitted" | "approved" | "fulfilled" | "declined";

export const IDEA_STATUSES = [
    "submitted",
    "under_review",
    "planned",
    "building",
    "shipped",
    "declined",
] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const IDEA_AREAS = ["product", "process", "ai_automation", "customer"] as const;
export type IdeaArea = (typeof IDEA_AREAS)[number];

export const IDEA_AREA_LABELS: Record<IdeaArea, string> = {
    product: "Product",
    process: "Process",
    ai_automation: "AI & automation",
    customer: "Customer",
};

export const COMPANY_VALUES = [
    "customer_first",
    "rigor",
    "ownership",
    "speed",
    "craft",
] as const;
export type CompanyValue = (typeof COMPANY_VALUES)[number];

export const COMPANY_VALUE_LABELS: Record<CompanyValue, string> = {
    customer_first: "Customer first",
    rigor: "Rigor",
    ownership: "Ownership",
    speed: "Speed",
    craft: "Craft",
};

export type LearningTrack =
    | "onboarding"
    | "product"
    | "sales"
    | "security"
    | "leadership";

export const LEARNING_TRACK_LABELS: Record<LearningTrack, string> = {
    onboarding: "Onboarding",
    product: "Product training",
    sales: "Sales playbooks",
    security: "Security & compliance",
    leadership: "Leadership",
};

export type AgentName = "finance" | "margin" | "labor" | "growth" | "capital";
// ─── Views returned by the workspace API ─────────────────────────────────

export interface EmployeeSummary {
    id: string;
    email: string;
    name: string;
    title: string | null;
    department: string | null;
    employmentRole: string;
    managerId: string | null;
    managerName: string | null;
}

export interface TaskView {
    id: string;
    title: string;
    detail: string | null;
    area: WorkArea;
    priority: TaskPriority;
    status: TaskStatus;
    dueAt: string | null;
    isOverdue: boolean;
    updatedAt: string;
}

export interface GoalView {
    id: string;
    objective: string;
    keyResult: string | null;
    quarter: string;
    target: number;
    current: number;
    unit: string;
    status: GoalStatus;
    progressPct: number;
}

export interface AnnouncementView {
    id: string;
    title: string;
    body: string;
    category: AnnouncementCategory;
    authorName: string;
    authorRole: string;
    pinned: boolean;
    publishedAt: string;
}

export interface DocView {
    id: string;
    title: string;
    category: DocCategory;
    body: string;
    tags: string[];
    updatedAt: string;
}

export interface DecisionView {
    id: string;
    title: string;
    context: string;
    decision: string;
    alternatives: string | null;
    decidedBy: string;
    decidedAt: string;
    tags: string[];
}

export interface RecognitionView {
    id: string;
    fromName: string;
    toName: string;
    message: string;
    value: CompanyValue;
    createdAt: string;
}

export interface RequestView {
    id: string;
    requesterId: string;
    requesterName: string;
    category: RequestCategory;
    title: string;
    detail: string | null;
    amount: number | null;
    status: RequestStatus;
    decidedByName: string | null;
    decidedAt: string | null;
    decisionNote: string | null;
    ageDays: number;
    createdAt: string;
}

export interface LearningModuleView {
    id: string;
    title: string;
    track: LearningTrack;
    summary: string;
    minutes: number;
    required: boolean;
    position: number;
    completed: boolean;
    completedAt: string | null;
}

export interface LearningTrackView {
    track: LearningTrack;
    modules: LearningModuleView[];
    completedCount: number;
    totalCount: number;
    minutesRemaining: number;
}

export interface AgentRuntimeStatus {
    name: AgentName;
    label: string;
    mandate: string;
    domain: "revenue" | "cost" | "efficiency" | "risk";
    openSignals: number;
    approvedSignals: number;
    declinedSignals: number;
    implementedSignals: number;
    openEstimatedImpact: number;
    realizedImpact: number;
    lastUpdatedAt: string | null;
}

export interface ImpactLedger {
    totalRealizedImpact: number;
    totalImplemented: number;
    companiesWithImpact: number;
    recent: {
        companyId: string;
        agent: AgentName;
        title: string;
        realizedImpact: number;
        updatedAt: string;
    }[];
}

export interface PlatformOverview {
    companies: number;
    employees: number;
    customerUsers: number;
    internalSharePct: number;
}

export interface WorkforceOpsSnapshot {
    openTasks: number;
    overdueTasks: number;
    openRequests: number;
    oldestRequestDays: number;
    announcementsLast30Days: number;
    ideasSubmitted: number;
    ideasShipped: number;
}

/**  A capability is either genuinely connected, or honestly reported as absent. */
export type CapabilityStatus =
    | { connected: true; provides: string; source: string }
    | { connected: false; provides: string; vendorType: string; note: string };

export interface CapabilityReportEntry {
    key: string;
    label: string;
    provides: string;
    status: CapabilityStatus;
    interimRoute: string;
}

export interface IdeaView {
    id: string;
    title: string;
    problem: string;
    proposal: string;
    area: IdeaArea;
    status: IdeaStatus;
    votes: number;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoadmapColumn {
    status: IdeaStatus;
    ideas: IdeaView[];
}

export interface BriefingItem {
    kind: "task" | "goal" | "learning" | "request" | "announcement";
    title: string;
    detail: string;
    href: string;
    isLate: boolean;
}

export interface DailyBriefing {
    employeeName: string;
    generatedAt: string;
    headline: string;
    counts: {
        tasksTotal: number;
        tasksDueNow: number;
        tasksOverdue: number;
        goalsAtRisk: number;
        requiredTrainingOutstanding: number;
        myOpenRequests: number;
    };
    items: BriefingItem[];
}

export interface CopilotAnswer {
    intent: string;
    answer: string;
    lines: string[];
    sources: string[];
}

export interface ComplianceRow {
    userId: string;
    name: string;
    completedRequired: number;
    totalRequired: number;
}
