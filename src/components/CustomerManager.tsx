import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, User } from "lucide-react";
import type { Customer } from "../types";
import { storage } from "../utils/storage";
import { useTheme } from "../context/ThemeContext";

const CustomerManager: React.FC = () => {
  const { isDark } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setCustomers(storage.getCustomers());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const customerData: Customer = {
      id: editingCustomer?.id || Date.now().toString(),
      ...formData,
      createdAt: editingCustomer?.createdAt || new Date().toISOString(),
    };

    let updatedCustomers;
    if (editingCustomer) {
      updatedCustomers = customers.map((c) =>
        c.id === editingCustomer.id ? customerData : c
      );
    } else {
      updatedCustomers = [...customers, customerData];
    }

    storage.saveCustomers(updatedCustomers);
    setCustomers(updatedCustomers);
    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      company: customer.company || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
      const updatedCustomers = customers.filter((c) => c.id !== id);
      storage.saveCustomers(updatedCustomers);
      setCustomers(updatedCustomers);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", address: "", company: "" });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Manajemen Pelanggan
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
            Kelola data pelanggan Anda
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDark ? "text-gray-400" : "text-gray-500"
          } w-5 h-5`}
        />
        <input
          type="text"
          placeholder="Cari pelanggan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 ${
            isDark
              ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
              : "bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500"
          } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${
              isDark
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-300"
            } border rounded-xl p-6 w-full max-w-md`}
          >
            <h3
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              {editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nama *"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-4 py-3 ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full px-4 py-3 ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              <input
                type="tel"
                placeholder="Nomor Telepon *"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={`w-full px-4 py-3 ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              <input
                type="text"
                placeholder="Perusahaan"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className={`w-full px-4 py-3 ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <textarea
                placeholder="Alamat *"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className={`w-full px-4 py-3 ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none`}
                required
              />
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  {editingCustomer ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  } ${
                    isDark ? "text-white" : "text-gray-900"
                  } py-3 rounded-lg transition-colors duration-200 font-medium`}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className={`${
              isDark
                ? "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                : "bg-white/50 border-gray-200 hover:border-gray-300"
            } backdrop-blur-xl border rounded-xl p-6 transition-all duration-200 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      isDark
                        ? "text-white group-hover:text-blue-400"
                        : "text-gray-900 group-hover:text-blue-600"
                    } transition-colors`}
                  >
                    {customer.name}
                  </h3>
                  {customer.company && (
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {customer.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(customer)}
                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {customer.email}
              </p>
              <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {customer.phone}
              </p>
              <p
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } text-xs`}
              >
                {customer.address}
              </p>
              <p
                className={`${
                  isDark ? "text-gray-500" : "text-gray-500"
                } text-xs`}
              >
                Bergabung:{" "}
                {new Date(customer.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User
            className={`w-16 h-16 ${
              isDark ? "text-gray-600" : "text-gray-400"
            } mx-auto mb-4`}
          />
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-gray-400" : "text-gray-600"
            } mb-2`}
          >
            {searchTerm ? "Pelanggan tidak ditemukan" : "Belum ada pelanggan"}
          </h3>
          <p className={`${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {searchTerm
              ? "Coba ubah kata kunci pencarian Anda"
              : "Mulai dengan menambahkan pelanggan pertama Anda"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
