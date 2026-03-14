export interface Dashboard {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrends: Record<string, number>;
}
