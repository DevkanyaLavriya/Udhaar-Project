import axios from 'axios';
import type { Customer, Transaction } from '@/lib/mock-data';
import type { ReminderSettings, ReminderLog } from '@/lib/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await api.get('/customers');
  return res.data;
};

export const addCustomer = async (customer: Omit<Customer, "id">): Promise<{ success: boolean; id: number }> => {
  const res = await api.post('/customers', customer);
  return res.data;
};

export const updateCustomer = async (id: number | string, customer: Partial<Customer>) => {
  const res = await api.put(`/customers/${id}`, customer);
  return res.data;
};

export const deleteCustomer = async (id: number | string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await api.get('/transactions');
  return res.data;
};

export const addTransaction = async (transaction: Omit<Transaction, "id">): Promise<{ success: boolean; id: number }> => {
  const res = await api.post('/transactions', transaction);
  return res.data;
};

export const getReminderSettings = async (): Promise<ReminderSettings | null> => {
  const res = await api.get('/reminders/settings');
  return res.data;
};

export const updateReminderSettings = async (settings: ReminderSettings): Promise<{ success: boolean }> => {
  const res = await api.post('/reminders/settings', settings);
  return res.data;
};

export const getReminderLogs = async (): Promise<ReminderLog[]> => {
  const res = await api.get('/reminders/logs');
  return res.data;
};

export const addReminderLog = async (log: ReminderLog): Promise<{ success: boolean }> => {
  const res = await api.post('/reminders/logs', log);
  return res.data;
};

export const getProfile = async (): Promise<{ shopName: string; phone: string }> => {
  const res = await api.get('/profile');
  return res.data;
};

export const updateProfile = async (profile: { shopName: string; phone: string }): Promise<{ success: boolean }> => {
  const res = await api.post('/profile', profile);
  return res.data;
};

export default api;
