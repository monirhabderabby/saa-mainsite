export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "ASSIGN"
  | "DELIVER"
  | "COMMENT"
  | "UPLOAD"
  | "REVIEW";

export interface AuditLogEntry {
  id: string;
  entity: string;
  entityId: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  action: AuditAction;
  createdAt: string;
  meta: {
    reason: string;
    triggeredBy: "USER" | "SYSTEM" | "AUTOMATION";
    ip?: string;
    userAgent?: string;
    oldValue?: string;
    newValue?: string;
    field?: string;
    [key: string]: unknown;
  };
}

export const sampleAuditLogs: AuditLogEntry[] = [
  {
    id: "log-001",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-001",
    actorName: "Md Anas",
    action: "DELIVER",
    createdAt: "2026-02-06T14:30:00Z",
    meta: {
      reason: "Project delivered to client FinCore Ltd",
      triggeredBy: "USER",
      ip: "192.168.1.45",
    },
  },
  {
    id: "log-002",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-002",
    actorName: "Monir Hossain Rabby",
    action: "STATUS_CHANGE",
    createdAt: "2026-02-06T12:15:00Z",
    meta: {
      reason: "Project status changed from In Progress to Under Review",
      triggeredBy: "USER",
      field: "status",
      oldValue: "In Progress",
      newValue: "Under Review",
    },
  },
  {
    id: "log-003",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-003",
    actorName: "Sarah Chen",
    action: "UPLOAD",
    createdAt: "2026-02-06T10:45:00Z",
    meta: {
      reason: "Uploaded final design mockups (3 files)",
      triggeredBy: "USER",
    },
  },
  {
    id: "log-004",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-002",
    actorName: "Monir Hossain Rabby",
    action: "ASSIGN",
    createdAt: "2026-02-05T16:20:00Z",
    meta: {
      reason: "Assigned Backend Devs team to the project",
      triggeredBy: "USER",
      field: "team",
      newValue: "Backend Devs",
    },
  },
  {
    id: "log-005",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-004",
    actorName: "Alex Rivera",
    action: "COMMENT",
    createdAt: "2026-02-05T14:00:00Z",
    meta: {
      reason:
        "Added a comment: 'Frontend integration looks great, ready for QA'",
      triggeredBy: "USER",
    },
  },
  {
    id: "log-006",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-002",
    actorName: "Monir Hossain Rabby",
    action: "UPDATE",
    createdAt: "2026-02-05T11:30:00Z",
    meta: {
      reason: "Updated project deadline",
      triggeredBy: "USER",
      field: "deadline",
      oldValue: "Feb 20, 2026",
      newValue: "Feb 25, 2026",
    },
  },
  {
    id: "log-007",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "system",
    actorName: "System",
    action: "STATUS_CHANGE",
    createdAt: "2026-02-04T09:00:00Z",
    meta: {
      reason: "Project automatically moved to In Progress",
      triggeredBy: "AUTOMATION",
      field: "status",
      oldValue: "Pending",
      newValue: "In Progress",
    },
  },
  {
    id: "log-008",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-002",
    actorName: "Monir Hossain Rabby",
    action: "ASSIGN",
    createdAt: "2026-02-04T08:45:00Z",
    meta: {
      reason: "Assigned UI/UX Designers and Frontend Devs teams",
      triggeredBy: "USER",
      field: "team",
      newValue: "UI/UX Designers, Frontend Devs",
    },
  },
  {
    id: "log-009",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-001",
    actorName: "Md Anas",
    action: "UPDATE",
    createdAt: "2026-02-03T17:30:00Z",
    meta: {
      reason: "Updated project value and monetary details",
      triggeredBy: "USER",
      field: "value",
      oldValue: "$1000",
      newValue: "$1200",
    },
  },
  {
    id: "log-010",
    entity: "project",
    entityId: "proj-158440312",
    actorId: "user-001",
    actorName: "Md Anas",
    action: "CREATE",
    createdAt: "2026-02-03T09:15:00Z",
    meta: {
      reason: "Project created by Md Anas",
      triggeredBy: "USER",
      ip: "192.168.1.22",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  },
];
