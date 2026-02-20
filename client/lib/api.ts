import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Accounts
export const getAccounts = async () => (await api.get('/api/accounts')).data;
export const createAccount = async (data: { page_id: string; access_token: string; webhook_secret?: string }) =>
    (await api.post('/api/accounts', data)).data;
export const deleteAccount = async (id: string) => (await api.delete(`/api/accounts/${id}`)).data;

// Rules
export const getRules = async (accountId?: string) =>
    (await api.get('/api/rules', { params: { accountId } })).data;
export const createRule = async (data: { account_id: string; keyword: string; reply_content: string }) =>
    (await api.post('/api/rules', data)).data;
export const updateRule = async (id: string, data: Partial<{ keyword: string; reply_content: string; is_active: boolean }>) =>
    (await api.put(`/api/rules/${id}`, data)).data;
export const deleteRule = async (id: string) => (await api.delete(`/api/rules/${id}`)).data;

// Unmatched Queries (via Supabase direct or backend proxy)
export const getUnmatchedQueries = async (accountId: string) =>
    (await api.get('/api/accounts/unmatched', { params: { accountId } })).data;
