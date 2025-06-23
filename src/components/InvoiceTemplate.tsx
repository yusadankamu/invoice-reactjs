import React from "react";
import type { Invoice } from "../types";
import { formatRupiah } from "../utils/currency";

interface InvoiceTemplateProps {
  invoice: Invoice;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice }) => {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="bg-white text-black p-8 max-w-4xl mx-auto print-area"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div
        className="border-b-3 border-blue-600 pb-6 mb-6"
        style={{ borderBottomWidth: "3px", borderBottomColor: "#3B82F6" }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1
              className="text-4xl font-bold text-blue-600 mb-2"
              style={{ color: "#3B82F6" }}
            >
              Studio Katalika
            </h1>
            <p className="text-gray-600">Professional Invoice System</p>
            <div className="mt-4 text-sm text-gray-600">
              <p>Jl. Contoh No. 123, Jakarta</p>
              <p>Telp: (021) 123-4567</p>
              <p>Email: admin@studiokatalika.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">
                No. Invoice: {invoice.invoiceNumber}
              </p>
              <p>Tanggal: {currentDate}</p>
              <p>
                Jatuh Tempo:{" "}
                {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold mb-3 text-blue-600"
          style={{ color: "#3B82F6" }}
        >
          Tagihan Kepada:
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold text-lg">{invoice.customerName}</p>
          <p className="text-gray-600">{invoice.customerEmail}</p>
          <p className="text-gray-600">{invoice.customerPhone}</p>
          <p className="text-gray-600 mt-2">{invoice.customerAddress}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th
                className="border border-blue-600 p-3 text-left"
                style={{ backgroundColor: "#3B82F6", color: "white" }}
              >
                No.
              </th>
              <th
                className="border border-blue-600 p-3 text-left"
                style={{ backgroundColor: "#3B82F6", color: "white" }}
              >
                Deskripsi
              </th>
              <th
                className="border border-blue-600 p-3 text-center"
                style={{ backgroundColor: "#3B82F6", color: "white" }}
              >
                Qty
              </th>
              <th
                className="border border-blue-600 p-3 text-right"
                style={{ backgroundColor: "#3B82F6", color: "white" }}
              >
                Harga Satuan
              </th>
              <th
                className="border border-blue-600 p-3 text-right"
                style={{ backgroundColor: "#3B82F6", color: "white" }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border border-gray-300 p-3">{index + 1}</td>
                <td className="border border-gray-300 p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 p-3 text-right">
                  {formatRupiah(item.price)}
                </td>
                <td className="border border-gray-300 p-3 text-right font-medium">
                  {formatRupiah(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-80">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN (11%):</span>
                <span>{formatRupiah(invoice.tax)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div
                  className="flex justify-between text-xl font-bold text-blue-600"
                  style={{ color: "#3B82F6" }}
                >
                  <span>Total:</span>
                  <span>{formatRupiah(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold mb-3 text-blue-600"
          style={{ color: "#3B82F6" }}
        >
          Informasi Pembayaran:
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Bank BCA</p>
              <p>No. Rek: 1234567890</p>
              <p>A.n: Studio Katalika</p>
            </div>
            <div>
              <p className="font-semibold">Bank Mandiri</p>
              <p>No. Rek: 0987654321</p>
              <p>A.n: Studio Katalika</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6">
          <h3
            className="text-lg font-semibold mb-3 text-blue-600"
            style={{ color: "#3B82F6" }}
          >
            Catatan:
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-6 mt-6">
        <div className="text-center text-gray-600">
          <p className="mb-2">
            Terima kasih atas kepercayaan Anda kepada Studio Katalika!
          </p>
          <p className="text-sm">
            Invoice ini dibuat secara otomatis oleh sistem Studio Katalika
          </p>
          <div className="mt-4 text-xs">
            <p>Dicetak pada: {new Date().toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
