import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogIn,
  Newspaper,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!formData.email || !formData.password) {
      setError("Email dan password harus diisi");
      setIsSubmitting(false);
      return;
    }

    const success = await login(formData.email, formData.password);

    if (!success) {
      setError("Email atau password salah");
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const fillDemoCredentials = (type: "admin" | "user") => {
    if (type === "admin") {
      setFormData({
        email: "admin@studiokatalika.com",
        password: "admin123",
      });
    } else {
      setFormData({
        email: "user@studiokatalika.com",
        password: "user123",
      });
    }
    setError("");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #8B5CF6 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-200 z-50 ${
          isDark
            ? "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 backdrop-blur-xl border border-gray-700"
            : "bg-white/50 hover:bg-white/70 text-gray-700 backdrop-blur-xl border border-gray-200"
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md px-6 relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isDark
                ? "bg-gradient-to-br from-blue-600 to-purple-600"
                : "bg-gradient-to-br from-blue-500 to-purple-500"
            }`}
          >
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Studio Katalika
          </h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Masuk ke sistem invoice Anda
          </p>
        </div>

        {/* Login Form */}
        <div
          className={`${
            isDark
              ? "bg-gray-900/50 border-gray-700"
              : "bg-white/70 border-gray-200"
          } backdrop-blur-xl border rounded-2xl p-8 shadow-2xl`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                    isDark
                      ? "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800"
                      : "bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Masukkan email Anda"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 ${
                    isDark
                      ? "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800"
                      : "bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Masukkan password Anda"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDark
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-colors`}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <LogIn className="w-5 h-5" />
                  <span>Masuk</span>
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-300/20">
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              } text-center mb-3`}
            >
              Akun Demo:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fillDemoCredentials("admin")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                }`}
                disabled={isSubmitting}
              >
                Admin
              </button>
              <button
                onClick={() => fillDemoCredentials("user")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600/30"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
                }`}
                disabled={isSubmitting}
              >
                User
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}
          >
            © 2025 Studio Katalika. Sistem Invoice Professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
