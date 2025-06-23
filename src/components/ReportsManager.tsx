import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import type { Invoice } from "../types";
import { storage } from "../utils/storage";
import { formatRupiah } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";

interface ReportData {
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalOutstanding: number;
  averageInvoiceValue: number;
  monthlyRevenue: { month: string; revenue: number; invoices: number }[];
  statusBreakdown: { status: string; count: number; amount: number }[];
  recentTransactions: Invoice[];
}

const ReportsManager: React.FC = () => {
  const { isDark } = useTheme();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, [dateRange, selectedStatus]);

  const generateReport = () => {
    setIsLoading(true);
    const invoices = storage.getInvoices();

    // Filter invoices by date range
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    // Filter by status if selected
    const statusFilteredInvoices =
      selectedStatus === "all"
        ? filteredInvoices
        : filteredInvoices.filter(
            (invoice) => invoice.status === selectedStatus
          );

    // Calculate metrics
    const paidInvoices = statusFilteredInvoices.filter(
      (inv) => inv.status === "paid"
    );
    const sentInvoices = statusFilteredInvoices.filter(
      (inv) => inv.status === "sent"
    );
    const overdueInvoices = statusFilteredInvoices.filter((inv) => {
      return inv.status === "sent" && new Date(inv.dueDate) < new Date();
    });

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOutstanding = sentInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );
    const averageInvoiceValue =
      statusFilteredInvoices.length > 0
        ? statusFilteredInvoices.reduce((sum, inv) => sum + inv.total, 0) /
          statusFilteredInvoices.length
        : 0;

    // Monthly revenue breakdown
    const monthlyData = new Map<
      string,
      { revenue: number; invoices: number }
    >();
    paidInvoices.forEach((invoice) => {
      const month = new Date(invoice.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
      });
      const existing = monthlyData.get(month) || { revenue: 0, invoices: 0 };
      monthlyData.set(month, {
        revenue: existing.revenue + invoice.total,
        invoices: existing.invoices + 1,
      });
    });

    const monthlyRevenue = Array.from(monthlyData.entries()).map(
      ([month, data]) => ({
        month,
        revenue: data.revenue,
        invoices: data.invoices,
      })
    );

    // Status breakdown
    const statusMap = new Map<string, { count: number; amount: number }>();
    statusFilteredInvoices.forEach((invoice) => {
      const existing = statusMap.get(invoice.status) || { count: 0, amount: 0 };
      statusMap.set(invoice.status, {
        count: existing.count + 1,
        amount: existing.amount + invoice.total,
      });
    });

    const statusBreakdown = Array.from(statusMap.entries()).map(
      ([status, data]) => ({
        status,
        count: data.count,
        amount: data.amount,
      })
    );

    setReportData({
      totalRevenue,
      paidInvoices: paidInvoices.length,
      pendingInvoices: sentInvoices.length,
      overdueInvoices: overdueInvoices.length,
      totalOutstanding,
      averageInvoiceValue,
      monthlyRevenue,
      statusBreakdown,
      recentTransactions: statusFilteredInvoices.slice(0, 10),
    });

    setIsLoading(false);
  };

  const exportReport = () => {
    if (!reportData) return;

    const reportContent = `
LAPORAN KEUANGAN STUDIO KATALIKA
Periode: ${new Date(dateRange.startDate).toLocaleDateString(
      "id-ID"
    )} - ${new Date(dateRange.endDate).toLocaleDateString("id-ID")}
Generated: ${new Date().toLocaleString("id-ID")}

=== RINGKASAN KEUANGAN ===
Total Pendapatan: ${formatRupiah(reportData.totalRevenue)}
Total Piutang: ${formatRupiah(reportData.totalOutstanding)}
Invoice Terbayar: ${reportData.paidInvoices}
Invoice Pending: ${reportData.pendingInvoices}
Invoice Terlambat: ${reportData.overdueInvoices}
Rata-rata Nilai Invoice: ${formatRupiah(reportData.averageInvoiceValue)}

=== BREAKDOWN STATUS ===
${reportData.statusBreakdown
  .map(
    (item) =>
      `${item.status.toUpperCase()}: ${item.count} invoice (${formatRupiah(
        item.amount
      )})`
  )
  .join("\n")}

=== PENDAPATAN BULANAN ===
${reportData.monthlyRevenue
  .map(
    (item) =>
      `${item.month}: ${formatRupiah(item.revenue)} (${item.invoices} invoice)`
  )
  .join("\n")}
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-keuangan-${dateRange.startDate}-${dateRange.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Terbayar";
      case "sent":
        return "Terkirim";
      case "overdue":
        return "Terlambat";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  if (isLoading || !reportData) {
    return (
      <div className="space-y-6">
        <div>
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Laporan Keuangan
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
            Memuat data laporan...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Laporan Keuangan
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
            Analisis pendapatan dan piutang
          </p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
        >
          <Download className="w-5 h-5" />
          <span>Export Laporan</span>
        </button>
      </div>

      {/* Filters */}
      <div
        className={`${
          isDark
            ? "bg-gray-900/50 border-gray-700"
            : "bg-white/50 border-gray-200"
        } backdrop-blur-xl border rounded-xl p-6`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className={`w-full px-4 py-3 ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className={`w-full px-4 py-3 ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full px-4 py-3 ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">Semua Status</option>
              <option value="paid">Terbayar</option>
              <option value="sent">Terkirim</option>
              <option value="draft">Draft</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={`${
            isDark
              ? "bg-gray-900/50 border-gray-700"
              : "bg-white/50 border-gray-200"
          } backdrop-blur-xl border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } text-sm font-medium`}
              >
                Total Pendapatan
              </p>
              <p
                className={`${
                  isDark ? "text-white" : "text-gray-900"
                } font-bold text-2xl mt-1`}
              >
                {formatRupiah(reportData.totalRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div
          className={`${
            isDark
              ? "bg-gray-900/50 border-gray-700"
              : "bg-white/50 border-gray-200"
          } backdrop-blur-xl border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } text-sm font-medium`}
              >
                Total Piutang
              </p>
              <p
                className={`${
                  isDark ? "text-white" : "text-gray-900"
                } font-bold text-2xl mt-1`}
              >
                {formatRupiah(reportData.totalOutstanding)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div
          className={`${
            isDark
              ? "bg-gray-900/50 border-gray-700"
              : "bg-white/50 border-gray-200"
          } backdrop-blur-xl border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } text-sm font-medium`}
              >
                Invoice Pending
              </p>
              <p
                className={`${
                  isDark ? "text-white" : "text-gray-900"
                } font-bold text-2xl mt-1`}
              >
                {reportData.pendingInvoices}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div
          className={`${
            isDark
              ? "bg-gray-900/50 border-gray-700"
              : "bg-white/50 border-gray-200"
          } backdrop-blur-xl border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } text-sm font-medium`}
              >
                Invoice Terlambat
              </p>
              <p
                className={`${
                  isDark ? "text-white" : "text-gray-900"
                } font-bold text-2xl mt-1`}
              >
                {reportData.overdueInvoices}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-500">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div
          className={`${
            isDark
              ? "bg-gray-900/50 border-gray-700"
              : "bg-white/50 border-gray-200"
          } backdrop-blur-xl border rounded-xl p-6`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Breakdown Status Invoice
          </h3>
          <div className="space-y-4">
            {reportData.statusBreakdown.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.status === "paid"
                        ? "bg-green-500"
                        : item.status === "sent"
                        ? "bg-blue-500"
                        : item.status === "overdue"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span
                    className={`${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } font-medium`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p
                    className={`${
                      isDark ? "text-white" : "text-gray-900"
                    } font-semibold`}
                  >
                    {item.count} invoice
                  </p>
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } text-sm`}
                  >
                    {formatRupiah(item.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div
          className={`${
            isDark
              ? "bg-gray-900/50 border-gray-700"
              : "bg-white/50 border-gray-200"
          } backdrop-blur-xl border rounded-xl p-6`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Pendapatan Bulanan
          </h3>
          <div className="space-y-4">
            {reportData.monthlyRevenue.slice(0, 6).map((item) => (
              <div
                key={item.month}
                className="flex items-center justify-between"
              >
                <div>
                  <p
                    className={`${
                      isDark ? "text-white" : "text-gray-900"
                    } font-medium`}
                  >
                    {item.month}
                  </p>
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } text-sm`}
                  >
                    {item.invoices} invoice
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`${
                      isDark ? "text-white" : "text-gray-900"
                    } font-semibold`}
                  >
                    {formatRupiah(item.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className={`${
          isDark
            ? "bg-gray-900/50 border-gray-700"
            : "bg-white/50 border-gray-200"
        } backdrop-blur-xl border rounded-xl p-6`}
      >
        <h3
          className={`text-xl font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-4`}
        >
          Transaksi Terbaru
        </h3>
        <div className="space-y-3">
          {reportData.recentTransactions.map((invoice) => (
            <div
              key={invoice.id}
              className={`flex items-center justify-between p-4 ${
                isDark ? "bg-gray-800/50" : "bg-gray-50"
              } rounded-lg`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {invoice.invoiceNumber}
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {invoice.customerName}
                  </p>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {new Date(invoice.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatRupiah(invoice.total)}
                </p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === "paid"
                      ? "bg-green-500/20 text-green-400"
                      : invoice.status === "sent"
                      ? "bg-blue-500/20 text-blue-400"
                      : invoice.status === "overdue"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {getStatusLabel(invoice.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div
        className={`${
          isDark
            ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700"
            : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
        } backdrop-blur-xl border rounded-xl p-6`}
      >
        <h3
          className={`text-xl font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-4`}
        >
          Ringkasan Periode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p
              className={`text-3xl font-bold ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {formatRupiah(reportData.averageInvoiceValue)}
            </p>
            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } text-sm mt-1`}
            >
              Rata-rata Nilai Invoice
            </p>
          </div>
          <div className="text-center">
            <p
              className={`text-3xl font-bold ${
                isDark ? "text-green-400" : "text-green-600"
              }`}
            >
              {(
                (reportData.paidInvoices /
                  (reportData.paidInvoices + reportData.pendingInvoices)) *
                  100 || 0
              ).toFixed(1)}
              %
            </p>
            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } text-sm mt-1`}
            >
              Tingkat Pembayaran
            </p>
          </div>
          <div className="text-center">
            <p
              className={`text-3xl font-bold ${
                isDark ? "text-purple-400" : "text-purple-600"
              }`}
            >
              {reportData.paidInvoices +
                reportData.pendingInvoices +
                reportData.overdueInvoices}
            </p>
            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } text-sm mt-1`}
            >
              Total Invoice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
