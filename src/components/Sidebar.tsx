import React from "react";
import {
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "customers", label: "Pelanggan", icon: Users },
    { id: "orders", label: "Pesanan", icon: ShoppingCart },
    { id: "invoices", label: "Invoice", icon: FileText },
    { id: "reports", label: "Laporan", icon: TrendingUp },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      logout();
    }
  };

  return (
    <div
      className={`w-64 ${
        isDark ? "bg-gray-900/50" : "bg-white/50"
      } backdrop-blur-xl border-r ${
        isDark ? "border-gray-800" : "border-gray-200"
      } h-screen fixed left-0 top-0 z-40 flex flex-col`}
    >
      <div
        className={`p-6 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Studio Katalika
        </h1>
        <p
          className={`${
            isDark ? "text-gray-400" : "text-gray-600"
          } text-sm mt-1`}
        >
          Invoice System
        </p>
      </div>

      {/* User Info */}
      <div
        className={`p-4 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              user?.role === "admin"
                ? "bg-gradient-to-br from-blue-500 to-purple-500"
                : "bg-gradient-to-br from-green-500 to-teal-500"
            }`}
          >
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`${
                isDark ? "text-white" : "text-gray-900"
              } font-medium text-sm truncate`}
            >
              {user?.name}
            </p>
            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } text-xs capitalize`}
            >
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 group ${
                activeTab === item.id
                  ? `${
                      isDark
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                        : "bg-gradient-to-r from-blue-100 to-purple-100"
                    } border-r-2 border-blue-500 text-blue-600`
                  : `${
                      isDark
                        ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/50"
                    }`
              }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${
                  activeTab === item.id ? "text-blue-500" : ""
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 mr-2" />
          ) : (
            <Moon className="w-5 h-5 mr-2" />
          )}
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Keluar
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
