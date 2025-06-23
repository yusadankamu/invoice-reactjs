import type { Invoice } from "../types";
import { formatRupiah } from "./currency";

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const timestamp = Date.now().toString().slice(-4);
  return `INV-${year}${month}-${timestamp}`;
};

export const calculateTax = (
  subtotal: number,
  taxRate: number = 0.11
): number => {
  return subtotal * taxRate;
};

export const shareViaWhatsApp = (invoice: Invoice): void => {
  const message = `
Halo ${invoice.customerName},

Berikut adalah invoice untuk pesanan Anda dari Studio Katalika:

📋 Invoice No: ${invoice.invoiceNumber}
📅 Tanggal: ${new Date(invoice.createdAt).toLocaleDateString("id-ID")}
💰 Total: ${formatRupiah(invoice.total)}
⏰ Jatuh Tempo: ${new Date(invoice.dueDate).toLocaleDateString("id-ID")}

Detail Pembayaran:
🏦 Bank BCA: 1234567890 a.n Studio Katalika
🏦 Bank Mandiri: 0987654321 a.n Studio Katalika

Terima kasih atas kepercayaan Anda kepada Studio Katalika.

Hormat kami,
Studio Katalika Team
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = invoice.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
};

export const downloadInvoiceAsPDF = (invoice: Invoice): void => {
  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const invoiceHTML = generateInvoiceHTML(invoice);

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

const generateInvoiceHTML = (invoice: Invoice): string => {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceNumber} - Studio Katalika</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 3px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
        .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
        .company-info h1 { color: #3B82F6; font-size: 2.5rem; margin-bottom: 5px; }
        .company-info p { color: #666; margin-bottom: 15px; }
        .company-details { font-size: 0.9rem; color: #666; }
        .invoice-info { text-align: right; }
        .invoice-info h2 { font-size: 2rem; color: #333; margin-bottom: 15px; }
        .invoice-details { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .bill-to { margin-bottom: 30px; }
        .bill-to h3 { color: #3B82F6; margin-bottom: 15px; font-size: 1.2rem; }
        .customer-info { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #3B82F6; color: white; padding: 12px; text-align: left; }
        .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .items-table tr:nth-child(even) { background: #f8f9fa; }
        .totals { margin-left: auto; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals-row.total { border-top: 2px solid #3B82F6; font-weight: bold; font-size: 1.2rem; color: #3B82F6; }
        .payment-info { margin: 30px 0; }
        .payment-info h3 { color: #3B82F6; margin-bottom: 15px; }
        .payment-details { background: #e3f2fd; padding: 15px; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .notes { margin: 20px 0; }
        .notes h3 { color: #3B82F6; margin-bottom: 10px; }
        .notes-content { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .footer { border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; }
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .invoice-container { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="header-content">
            <div class="company-info">
              <h1>Studio Katalika</h1>
              <p>Professional Invoice System</p>
              <div class="company-details">
                <p>Jl. Contoh No. 123, Jakarta</p>
                <p>Telp: (021) 123-4567</p>
                <p>Email: admin@studiokatalika.com</p>
              </div>
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <div class="invoice-details">
                <p><strong>No. Invoice:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Tanggal:</strong> ${currentDate}</p>
                <p><strong>Jatuh Tempo:</strong> ${new Date(
                  invoice.dueDate
                ).toLocaleDateString("id-ID")}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bill-to">
          <h3>Tagihan Kepada:</h3>
          <div class="customer-info">
            <p><strong>${invoice.customerName}</strong></p>
            <p>${invoice.customerEmail}</p>
            <p>${invoice.customerPhone}</p>
            <p>${invoice.customerAddress}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Deskripsi</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Harga Satuan</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  <strong>${item.name}</strong>
                  ${
                    item.description
                      ? `<br><small style="color: #666;">${item.description}</small>`
                      : ""
                  }
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${formatRupiah(item.price)}</td>
                <td style="text-align: right;"><strong>${formatRupiah(
                  item.total
                )}</strong></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${formatRupiah(invoice.subtotal)}</span>
          </div>
          <div class="totals-row">
            <span>PPN (11%):</span>
            <span>${formatRupiah(invoice.tax)}</span>
          </div>
          <div class="totals-row total">
            <span>Total:</span>
            <span>${formatRupiah(invoice.total)}</span>
          </div>
        </div>

        <div class="payment-info">
          <h3>Informasi Pembayaran:</h3>
          <div class="payment-details">
            <div>
              <p><strong>Bank BCA</strong></p>
              <p>No. Rek: 1234567890</p>
              <p>A.n: Studio Katalika</p>
            </div>
            <div>
              <p><strong>Bank Mandiri</strong></p>
              <p>No. Rek: 0987654321</p>
              <p>A.n: Studio Katalika</p>
            </div>
          </div>
        </div>

        ${
          invoice.notes
            ? `
          <div class="notes">
            <h3>Catatan:</h3>
            <div class="notes-content">
              <p>${invoice.notes}</p>
            </div>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>Terima kasih atas kepercayaan Anda kepada Studio Katalika!</p>
          <p><small>Invoice ini dibuat secara otomatis oleh sistem Studio Katalika</small></p>
          <p><small>Dicetak pada: ${new Date().toLocaleString(
            "id-ID"
          )}</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
};
