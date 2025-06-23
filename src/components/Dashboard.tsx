import React from "react";
import { Users, ShoppingCart, FileText, TrendingUp } from "lucide-react";
import { storage } from "../utils/storage";
import { formatRupiah } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const customers = storage.getCustomers();
  const orders = storage.getOrders();
  const invoices = storage.getInvoices();

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const stats = [
    {
      title: "Total Pelanggan",
      value: customers.length.toString(),
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bg: isDark
        ? "from-blue-500/10 to-cyan-500/10"
        : "from-blue-50 to-cyan-50",
    },
    {
      title: "Pesanan Aktif",
      value: orders.filter((o) => o.status !== "completed").length.toString(),
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-500",
      bg: isDark
        ? "from-green-500/10 to-emerald-500/10"
        : "from-green-50 to-emerald-50",
    },
    {
      title: "Total Invoice",
      value: invoices.length.toString(),
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      bg: isDark
        ? "from-purple-500/10 to-pink-500/10"
        : "from-purple-50 to-pink-50",
    },
    {
      title: "Total Pendapatan",
      value: formatRupiah(totalRevenue),
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      bg: isDark
        ? "from-orange-500/10 to-red-500/10"
        : "from-orange-50 to-red-50",
      valueClass: "text-lg",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2
          className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-2`}
        >
          Dashboard
        </h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Selamat datang di sistem invoice Studio Katalika
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl border ${
                isDark ? "border-gray-800" : "border-gray-200"
              } bg-gradient-to-br ${
                stat.bg
              } backdrop-blur-sm p-6 hover:scale-105 transition-transform duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } text-sm font-medium`}
                  >
                    {stat.title}
                  </p>
                  <p
                    className={`${
                      isDark ? "text-white" : "text-gray-900"
                    } font-bold mt-1 ${stat.valueClass || "text-2xl"}`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}
              ></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          className={`${
            isDark ? "bg-gray-900/50" : "bg-white/50"
          } backdrop-blur-xl border ${
            isDark ? "border-gray-800" : "border-gray-200"
          } rounded-xl p-6`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Pesanan Terbaru
          </h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className={`flex items-center justify-between p-3 ${
                  isDark ? "bg-gray-800/50" : "bg-gray-50"
                } rounded-lg`}
              >
                <div>
                  <p
                    className={`font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {order.customerName}
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatRupiah(order.total)}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : order.status === "processing"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`${
            isDark ? "bg-gray-900/50" : "bg-white/50"
          } backdrop-blur-xl border ${
            isDark ? "border-gray-800" : "border-gray-200"
          } rounded-xl p-6`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Invoice Pending
          </h3>
          <div className="space-y-3">
            {invoices
              .filter((inv) => inv.status === "sent")
              .slice(0, 5)
              .map((invoice) => (
                <div
                  key={invoice.id}
                  className={`flex items-center justify-between p-3 ${
                    isDark ? "bg-gray-800/50" : "bg-gray-50"
                  } rounded-lg`}
                >
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
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatRupiah(invoice.total)}
                    </p>
                    <p className="text-xs text-yellow-400">
                      Jatuh tempo:{" "}
                      {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
