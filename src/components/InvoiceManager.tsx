import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  Download,
  Send,
  Eye,
} from "lucide-react";
import type { Invoice, Order, Customer } from "../types";
import { storage } from "../utils/storage";
import { formatRupiah } from "../utils/currency";
import {
  generateInvoiceNumber,
  shareViaWhatsApp,
  downloadInvoiceAsPDF,
} from "../utils/invoice";
import { useTheme } from "../context/ThemeContext";
import InvoiceTemplate from "./InvoiceTemplate";

const InvoiceManager: React.FC = () => {
  const { isDark } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    orderId: "",
    dueDate: "",
    notes: "",
    status: "draft" as Invoice["status"],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInvoices(storage.getInvoices());
    setOrders(storage.getOrders());
    setCustomers(storage.getCustomers());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderId) {
      alert("Pilih pesanan terlebih dahulu");
      return;
    }

    const order = orders.find((o) => o.id === formData.orderId);
    const customer = customers.find((c) => c.id === order?.customerId);

    if (!order || !customer) return;

    const invoiceData: Invoice = {
      id: editingInvoice?.id || Date.now().toString(),
      orderId: formData.orderId,
      customerId: order.customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: formData.status,
      dueDate: formData.dueDate,
      notes: formData.notes,
      invoiceNumber: editingInvoice?.invoiceNumber || generateInvoiceNumber(),
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
    };

    let updatedInvoices;
    if (editingInvoice) {
      updatedInvoices = invoices.map((i) =>
        i.id === editingInvoice.id ? invoiceData : i
      );
    } else {
      updatedInvoices = [...invoices, invoiceData];
    }

    storage.saveInvoices(updatedInvoices);
    setInvoices(updatedInvoices);
    resetForm();
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      orderId: invoice.orderId,
      dueDate: invoice.dueDate.split("T")[0],
      notes: invoice.notes || "",
      status: invoice.status,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus invoice ini?")) {
      const updatedInvoices = invoices.filter((i) => i.id !== id);
      storage.saveInvoices(updatedInvoices);
      setInvoices(updatedInvoices);
    }
  };

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setShowPreview(true);
  };

  const handleDownload = (invoice: Invoice) => {
    downloadInvoiceAsPDF(invoice);
  };

  const handleWhatsAppShare = (invoice: Invoice) => {
    shareViaWhatsApp(invoice);
  };

  const resetForm = () => {
    setFormData({
      orderId: "",
      dueDate: "",
      notes: "",
      status: "draft",
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableOrders = orders.filter(
    (order) =>
      !invoices.some((invoice) => invoice.orderId === order.id) ||
      (editingInvoice && editingInvoice.orderId === order.id)
  );

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400";
      case "sent":
        return "bg-blue-500/20 text-blue-400";
      case "overdue":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Manajemen Invoice
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
            Kelola dan kirim invoice kepada pelanggan
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Invoice</span>
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
          placeholder="Cari invoice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 ${
            isDark
              ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
              : "bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500"
          } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
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
              {editingInvoice ? "Edit Invoice" : "Buat Invoice Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Pesanan *
                </label>
                <select
                  value={formData.orderId}
                  onChange={(e) =>
                    setFormData({ ...formData, orderId: e.target.value })
                  }
                  className={`w-full px-4 py-3 ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                >
                  <option value="">Pilih Pesanan</option>
                  {availableOrders.map((order) => {
                    const customer = customers.find(
                      (c) => c.id === order.customerId
                    );
                    return (
                      <option key={order.id} value={order.id}>
                        #{order.id.slice(-6)} - {customer?.name} (
                        {formatRupiah(order.total)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Tanggal Jatuh Tempo *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className={`w-full px-4 py-3 ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Invoice["status"],
                    })
                  }
                  className={`w-full px-4 py-3 ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Terkirim</option>
                  <option value="paid">Dibayar</option>
                  <option value="overdue">Terlambat</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className={`w-full px-4 py-3 ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-20 resize-none`}
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                >
                  {editingInvoice ? "Update" : "Buat Invoice"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                  } py-3 rounded-lg transition-colors duration-200 font-medium`}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPreview && previewInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl max-h-screen overflow-y-auto">
            <div
              className={`${
                isDark ? "bg-gray-900" : "bg-gray-800"
              } p-4 flex justify-between items-center`}
            >
              <h3 className="text-white font-semibold">Preview Invoice</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(previewInvoice)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
            <InvoiceTemplate invoice={previewInvoice} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`${
              isDark
                ? "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                : "bg-white/50 border-gray-200 hover:border-gray-300"
            } backdrop-blur-xl border rounded-xl p-6 transition-all duration-200`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    } text-lg`}
                  >
                    {invoice.invoiceNumber}
                  </h3>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {invoice.customerName}
                  </p>
                  <p
                    className={`${
                      isDark ? "text-gray-500" : "text-gray-500"
                    } text-sm`}
                  >
                    Dibuat:{" "}
                    {new Date(invoice.createdAt).toLocaleDateString("id-ID")}
                  </p>
                  <p
                    className={`${
                      isDark ? "text-gray-500" : "text-gray-500"
                    } text-sm`}
                  >
                    Jatuh tempo:{" "}
                    {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatRupiah(invoice.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePreview(invoice)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => handleDownload(invoice)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => handleWhatsAppShare(invoice)}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleEdit(invoice)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(invoice.id)}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            </div>

            {invoice.notes && (
              <div
                className={`mt-4 p-3 ${
                  isDark ? "bg-gray-800/30" : "bg-gray-100"
                } rounded-lg`}
              >
                <p
                  className={`${
                    isDark ? "text-gray-400" : "text-gray-600"
                  } text-sm`}
                >
                  <span className="font-medium">Catatan:</span> {invoice.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText
            className={`w-16 h-16 ${
              isDark ? "text-gray-600" : "text-gray-400"
            } mx-auto mb-4`}
          />
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-gray-400" : "text-gray-600"
            } mb-2`}
          >
            {searchTerm ? "Invoice tidak ditemukan" : "Belum ada invoice"}
          </h3>
          <p className={`${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {searchTerm
              ? "Coba ubah kata kunci pencarian Anda"
              : "Mulai dengan membuat invoice pertama dari pesanan"}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;
