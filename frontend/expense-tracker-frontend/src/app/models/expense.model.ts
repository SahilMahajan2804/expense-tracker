export interface Expense {
  expenseId: number;
  userId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  categoryId: number;
  categoryName: string;
  amount: number;
  description: string;
  expenseDate: Date;
  status: ExpenseStatus;
  submittedAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
  approvals?: Approval[];
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ExpenseRequest {
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: number;
}

export interface Approval {
  approvalId: number;
  expenseId: number;
  adminId: number;
  adminName: string;
  decision: ApprovalDecision;
  remarks: string;
  decisionDate: Date;
}

export enum ApprovalDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ApprovalRequest {
  decision: ApprovalDecision;
  remarks?: string;
}

export interface Attachment {
  attachmentId: number;
  expenseId: number;
  fileName: string;
  filePath: string;
  uploadedAt: Date;
}
