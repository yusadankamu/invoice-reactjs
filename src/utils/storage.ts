import type { Customer, Order, Invoice } from "../types";

const STORAGE_KEYS = {
  CUSTOMERS: "studio_katalika_customers",
  ORDERS: "studio_katalika_orders",
  INVOICES: "studio_katalika_invoices",
};

export const storage = {
  // Customers
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },

  saveCustomers: (customers: Customer[]): void => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  // Orders
  getOrders: (): Order[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },

  saveOrders: (orders: Order[]): void => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  // Invoices
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  },

  saveInvoices: (invoices: Invoice[]): void => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },
};
