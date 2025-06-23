import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CustomerManager from "./components/CustomerManager";
import OrderManager from "./components/OrderManager";
import InvoiceManager from "./components/InvoiceManager";
import ReportsManager from "./components/ReportsManager";
import { useTheme } from "./context/ThemeContext";

function AppContent() {
  const { isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Memuat aplikasi...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "customers":
        return <CustomerManager />;
      case "orders":
        return <OrderManager />;
      case "invoices":
        return <InvoiceManager />;
      case "reports":
        return <ReportsManager />;
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2
                className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Pengaturan
              </h2>
              <p
                className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}
              >
                Konfigurasi sistem invoice
              </p>
            </div>
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
                Informasi Perusahaan
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    defaultValue="Studio Katalika"
                    className={`w-full px-4 py-3 ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Alamat
                  </label>
                  <textarea
                    defaultValue="Jl. Contoh No. 123, Jakarta"
                    className={`w-full px-4 py-3 ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-20 resize-none`}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      } mb-2`}
                    >
                      Telepon
                    </label>
                    <input
                      type="tel"
                      defaultValue="(021) 123-4567"
                      className={`w-full px-4 py-3 ${
                        isDark
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-900"
                      } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      } mb-2`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@studiokatalika.com"
                      className={`w-full px-4 py-3 ${
                        isDark
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-900"
                      } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                </div>
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #8B5CF6 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="ml-64 p-8 relative z-10">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
