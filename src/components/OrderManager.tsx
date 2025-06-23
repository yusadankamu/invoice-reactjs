import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, ShoppingCart, User } from "lucide-react";
import type { Order, Customer, OrderItem } from "../types";
import { storage } from "../utils/storage";
import { formatRupiah } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";

const OrderManager: React.FC = () => {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    customerId: "",
    items: [{ name: "", description: "", quantity: 1, price: 0 }] as Omit<
      OrderItem,
      "id" | "total"
    >[],
    notes: "",
    status: "pending" as Order["status"],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(storage.getOrders());
    setCustomers(storage.getCustomers());
  };

  const calculateItemTotal = (item: Omit<OrderItem, "id" | "total">) => {
    return item.quantity * item.price;
  };

  const calculateOrderTotals = (items: Omit<OrderItem, "id" | "total">[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0
    );
    const tax = subtotal * 0.11; // 11% PPN
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert("Pilih pelanggan terlebih dahulu");
      return;
    }

    const customer = customers.find((c) => c.id === formData.customerId);
    if (!customer) return;

    const orderItems: OrderItem[] = formData.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      ...item,
      total: calculateItemTotal(item),
    }));

    const { subtotal, tax, total } = calculateOrderTotals(formData.items);

    const orderData: Order = {
      id: editingOrder?.id || Date.now().toString(),
      customerId: formData.customerId,
      customerName: customer.name,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: formData.status,
      notes: formData.notes,
      createdAt: editingOrder?.createdAt || new Date().toISOString(),
    };

    let updatedOrders;
    if (editingOrder) {
      updatedOrders = orders.map((o) =>
        o.id === editingOrder.id ? orderData : o
      );
    } else {
      updatedOrders = [...orders, orderData];
    }

    storage.saveOrders(updatedOrders);
    setOrders(updatedOrders);
    resetForm();
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      items: order.items.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      })),
      notes: order.notes || "",
      status: order.status,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
      const updatedOrders = orders.filter((o) => o.id !== id);
      storage.saveOrders(updatedOrders);
      setOrders(updatedOrders);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      items: [{ name: "", description: "", quantity: 1, price: 0 }],
      notes: "",
      status: "pending",
    });
    setEditingOrder(null);
    setShowForm(false);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { name: "", description: "", quantity: 1, price: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "processing":
        return "bg-blue-500/20 text-blue-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const { subtotal, tax, total } = calculateOrderTotals(formData.items);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Manajemen Pesanan
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
            Kelola pesanan pelanggan
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Pesanan</span>
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
          placeholder="Cari pesanan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 ${
            isDark
              ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
              : "bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500"
          } border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className={`${
              isDark
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-300"
            } border rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto`}
          >
            <h3
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              {editingOrder ? "Edit Pesanan" : "Buat Pesanan Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Pelanggan *
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value })
                    }
                    className={`w-full px-4 py-3 ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                    required
                  >
                    <option value="">Pilih Pelanggan</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
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
                        status: e.target.value as Order["status"],
                      })
                    }
                    className={`w-full px-4 py-3 ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4
                    className={`text-lg font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Item Pesanan
                  </h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Tambah Item
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className={`${
                        isDark
                          ? "bg-gray-800/50 border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      } p-4 rounded-lg border`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3">
                          <label
                            className={`block text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            } mb-1`}
                          >
                            Nama Item *
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(index, "name", e.target.value)
                            }
                            className={`w-full px-3 py-2 ${
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            } border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                            required
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label
                            className={`block text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            } mb-1`}
                          >
                            Deskripsi
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            className={`w-full px-3 py-2 ${
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            } border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label
                            className={`block text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            } mb-1`}
                          >
                            Qty *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className={`w-full px-3 py-2 ${
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            } border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label
                            className={`block text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            } mb-1`}
                          >
                            Harga *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={`w-full px-3 py-2 ${
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            } border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                            required
                          />
                        </div>
                        <div className="md:col-span-1">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Total: {formatRupiah(calculateItemTotal(item))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`${
                  isDark ? "bg-gray-800/30" : "bg-gray-100"
                } p-4 rounded-lg`}
              >
                <div className="space-y-2 text-right">
                  <div className="flex justify-between text-sm">
                    <span
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Subtotal:
                    </span>
                    <span
                      className={`${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      PPN (11%):
                    </span>
                    <span
                      className={`${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {formatRupiah(tax)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between text-lg font-semibold border-t ${
                      isDark ? "border-gray-700" : "border-gray-300"
                    } pt-2`}
                  >
                    <span
                      className={`${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Total:
                    </span>
                    <span className="text-green-500">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
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
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none`}
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-medium"
                >
                  {editingOrder ? "Update Pesanan" : "Buat Pesanan"}
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

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`${
              isDark
                ? "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                : "bg-white/50 border-gray-200 hover:border-gray-300"
            } backdrop-blur-xl border rounded-xl p-6 transition-all duration-200`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    } text-lg`}
                  >
                    Pesanan #{order.id.slice(-6)}
                  </h3>
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } flex items-center space-x-2`}
                  >
                    <User className="w-4 h-4" />
                    <span>{order.customerName}</span>
                  </p>
                  <p
                    className={`${
                      isDark ? "text-gray-500" : "text-gray-500"
                    } text-sm`}
                  >
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(order)}
                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center py-2 border-b ${
                    isDark ? "border-gray-800" : "border-gray-200"
                  } last:border-b-0`}
                >
                  <div>
                    <p
                      className={`${
                        isDark ? "text-white" : "text-gray-900"
                      } font-medium`}
                    >
                      {item.name}
                    </p>
                    {item.description && (
                      <p
                        className={`${
                          isDark ? "text-gray-400" : "text-gray-600"
                        } text-sm`}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`${isDark ? "text-white" : "text-gray-900"}`}>
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      } text-sm`}
                    >
                      {formatRupiah(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`${
                isDark ? "bg-gray-800/30" : "bg-gray-100"
              } p-4 rounded-lg`}
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span
                    className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Subtotal:
                  </span>
                  <span
                    className={`${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {formatRupiah(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span
                    className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    PPN (11%):
                  </span>
                  <span
                    className={`${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {formatRupiah(order.tax)}
                  </span>
                </div>
                <div
                  className={`flex justify-between text-lg font-bold border-t ${
                    isDark ? "border-gray-700" : "border-gray-300"
                  } pt-2`}
                >
                  <span
                    className={`${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Total:
                  </span>
                  <span className="text-green-500">
                    {formatRupiah(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4">
                <p
                  className={`${
                    isDark ? "text-gray-400" : "text-gray-600"
                  } text-sm`}
                >
                  <span className="font-medium">Catatan:</span> {order.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart
            className={`w-16 h-16 ${
              isDark ? "text-gray-600" : "text-gray-400"
            } mx-auto mb-4`}
          />
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-gray-400" : "text-gray-600"
            } mb-2`}
          >
            {searchTerm ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}
          </h3>
          <p className={`${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {searchTerm
              ? "Coba ubah kata kunci pencarian Anda"
              : "Mulai dengan membuat pesanan pertama"}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
