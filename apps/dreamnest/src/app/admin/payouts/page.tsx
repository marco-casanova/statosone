"use client";

import { useState, useEffect, useTransition } from "react";
import {
  DollarSign,
  Users,
  BookOpen,
  Calendar,
  Check,
  X,
  RefreshCw,
  ChevronDown,
  Clock,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calculator,
  Send,
} from "lucide-react";
import {
  getRevenuePeriods,
  getPayoutDashboardStats,
  getAllPayouts,
  getOrCreateRevenuePeriod,
  updateRevenuePeriod,
  updateCreatorPool,
  aggregateEngagementForPeriod,
  calculatePoolDistribution,
  approvePayout,
  bulkApprovePayouts,
  markPayoutPaid,
  cancelPayout,
} from "@/actions/admin-payouts";

interface RevenuePeriod {
  id: string;
  period_month: string;
  currency: string;
  subscription_gross_revenue: number;
  subscription_net_revenue: number;
  subscription_fees?: number;
  subscription_refunds?: number;
  ppv_gross_revenue: number;
  ppv_net_revenue: number;
  ppv_fees?: number;
  ppv_refunds?: number;
  status: string;
  creator_pool?: {
    id: string;
    pool_percent: number;
    pool_amount_net: number;
    total_eligible_units: number;
    calculated_at: string | null;
  } | null;
}

interface Payout {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  engagement_units?: number;
  pool_share_percent?: number;
  created_at: string;
  author?: {
    id: string;
    payout_email?: string;
    user?: {
      display_name?: string;
      email?: string;
    };
  };
  period?: {
    period_month?: string;
  };
  purchase?: {
    book?: {
      title?: string;
    };
  };
}

interface DashboardStats {
  current_period: RevenuePeriod | null;
  pending_payouts: number;
  pending_amount: number;
  approved_payouts: number;
  paid_this_month: number;
  active_authors: number;
}

export default function AdminPayoutsPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [periods, setPeriods] = useState<RevenuePeriod[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(true);

  // Edit modal state
  const [editingPeriod, setEditingPeriod] = useState<RevenuePeriod | null>(
    null
  );

  // Load data
  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [statsData, periodsData, payoutsData] = await Promise.all([
        getPayoutDashboardStats(),
        getRevenuePeriods(),
        getAllPayouts({ status: statusFilter }),
      ]);
      setStats(statsData);
      setPeriods(periodsData as RevenuePeriod[]);
      setPayouts(payoutsData as Payout[]);
    } catch (error) {
      console.error("Failed to load data:", error);
      setMessage({ type: "error", text: "Failed to load payout data" });
    } finally {
      setIsLoading(false);
    }
  }

  // Actions
  const handleCreatePeriod = () => {
    startTransition(async () => {
      try {
        await getOrCreateRevenuePeriod();
        await loadData();
        setMessage({ type: "success", text: "Period created successfully" });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to create period" });
      }
    });
  };

  const handleAggregateEngagement = (periodMonth: string) => {
    startTransition(async () => {
      try {
        const result = await aggregateEngagementForPeriod(periodMonth);
        await loadData();
        setMessage({
          type: "success",
          text: `Aggregated engagement for ${result.books_processed} books`,
        });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to aggregate engagement" });
      }
    });
  };

  const handleCalculatePool = (periodId: string) => {
    startTransition(async () => {
      try {
        const result = await calculatePoolDistribution(periodId);
        await loadData();
        setMessage({
          type: "success",
          text: `Pool calculated: €${result.pool_amount.toFixed(2)} for ${
            result.books_count
          } books`,
        });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to calculate pool" });
      }
    });
  };

  const handleApprovePayout = (payoutId: string) => {
    startTransition(async () => {
      try {
        await approvePayout(payoutId);
        await loadData();
        setMessage({ type: "success", text: "Payout approved" });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to approve payout" });
      }
    });
  };

  const handleBulkApprove = () => {
    if (selectedPayouts.length === 0) return;
    startTransition(async () => {
      try {
        await bulkApprovePayouts(selectedPayouts);
        setSelectedPayouts([]);
        await loadData();
        setMessage({
          type: "success",
          text: `${selectedPayouts.length} payouts approved`,
        });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to approve payouts" });
      }
    });
  };

  const handleMarkPaid = (payoutId: string) => {
    startTransition(async () => {
      try {
        await markPayoutPaid(payoutId);
        await loadData();
        setMessage({ type: "success", text: "Payout marked as paid" });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to mark payout as paid" });
      }
    });
  };

  const handleCancelPayout = (payoutId: string) => {
    if (!confirm("Are you sure you want to cancel this payout?")) return;
    startTransition(async () => {
      try {
        await cancelPayout(payoutId);
        await loadData();
        setMessage({ type: "success", text: "Payout cancelled" });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to cancel payout" });
      }
    });
  };

  const handleUpdatePeriod = async (updates: Partial<RevenuePeriod>) => {
    if (!editingPeriod) return;
    startTransition(async () => {
      try {
        await updateRevenuePeriod(editingPeriod.id, updates);
        setEditingPeriod(null);
        await loadData();
        setMessage({ type: "success", text: "Period updated successfully" });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to update period" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-purple-600" />
            Payout Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage creator payouts and revenue periods
          </p>
        </div>
        <button
          onClick={handleCreatePeriod}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <Calendar className="h-4 w-4" />
          Create Period
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending_payouts}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  €{stats.pending_amount.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Pending Amount</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Check className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approved_payouts}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  €{stats.paid_this_month.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Paid This Month</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active_authors}
                </p>
                <p className="text-sm text-gray-600">Active Authors</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Periods */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Revenue Periods
          </h2>
          <button
            onClick={loadData}
            disabled={isPending}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw
              className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Period
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Sub Revenue
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  PPV Revenue
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Pool %
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Pool Amount
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {periods.map((period) => (
                <tr key={period.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {period.period_month}
                  </td>
                  <td className="px-4 py-3 text-right">
                    €{Number(period.subscription_net_revenue).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    €{Number(period.ppv_net_revenue).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {period.creator_pool?.pool_percent || 30}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    €
                    {Number(period.creator_pool?.pool_amount_net || 0).toFixed(
                      2
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        period.status === "finalized"
                          ? "bg-green-100 text-green-700"
                          : period.status === "closed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {period.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingPeriod(period)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleAggregateEngagement(period.period_month)
                        }
                        disabled={isPending || period.status === "finalized"}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                        title="Aggregate Engagement"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCalculatePool(period.id)}
                        disabled={isPending || period.status === "finalized"}
                        className="p-1 text-purple-600 hover:bg-purple-100 rounded disabled:opacity-50"
                        title="Calculate Pool"
                      >
                        <Calculator className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {periods.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No revenue periods yet. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payouts
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="">All</option>
            </select>
            {selectedPayouts.length > 0 && statusFilter === "pending" && (
              <button
                onClick={handleBulkApprove}
                disabled={isPending}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Approve Selected ({selectedPayouts.length})
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {statusFilter === "pending" && (
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayouts(payouts.map((p) => p.id));
                        } else {
                          setSelectedPayouts([]);
                        }
                      }}
                      checked={
                        selectedPayouts.length === payouts.length &&
                        payouts.length > 0
                      }
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Period/Book
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  {statusFilter === "pending" && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPayouts.includes(payout.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPayouts([...selectedPayouts, payout.id]);
                          } else {
                            setSelectedPayouts(
                              selectedPayouts.filter((id) => id !== payout.id)
                            );
                          }
                        }}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">
                        {payout.author?.user?.display_name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payout.author?.payout_email ||
                          payout.author?.user?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        payout.type === "ppv"
                          ? "bg-blue-100 text-blue-700"
                          : payout.type === "subscription_pool"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {payout.type === "ppv"
                        ? "Sale"
                        : payout.type === "subscription_pool"
                        ? "Pool"
                        : payout.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    €{Number(payout.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {payout.period?.period_month ||
                      payout.purchase?.book?.title ||
                      "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        payout.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : payout.status === "approved"
                          ? "bg-blue-100 text-blue-700"
                          : payout.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {payout.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprovePayout(payout.id)}
                            disabled={isPending}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCancelPayout(payout.id)}
                            disabled={isPending}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {payout.status === "approved" && (
                        <button
                          onClick={() => handleMarkPaid(payout.id)}
                          disabled={isPending}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Mark as Paid"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td
                    colSpan={statusFilter === "pending" ? 7 : 6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No payouts found with status: {statusFilter || "any"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Period Modal */}
      {editingPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Edit Period: {editingPeriod.period_month}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdatePeriod({
                  subscription_gross_revenue: Number(
                    formData.get("subscription_gross_revenue")
                  ),
                  subscription_fees: Number(formData.get("subscription_fees")),
                  ppv_gross_revenue: Number(formData.get("ppv_gross_revenue")),
                  ppv_fees: Number(formData.get("ppv_fees")),
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Gross
                  </label>
                  <input
                    type="number"
                    name="subscription_gross_revenue"
                    step="0.01"
                    defaultValue={editingPeriod.subscription_gross_revenue}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Fees
                  </label>
                  <input
                    type="number"
                    name="subscription_fees"
                    step="0.01"
                    defaultValue={0}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PPV Gross
                  </label>
                  <input
                    type="number"
                    name="ppv_gross_revenue"
                    step="0.01"
                    defaultValue={editingPeriod.ppv_gross_revenue}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PPV Fees
                  </label>
                  <input
                    type="number"
                    name="ppv_fees"
                    step="0.01"
                    defaultValue={0}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPeriod(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
