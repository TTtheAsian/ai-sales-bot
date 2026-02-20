import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAccounts = async () => (await api.get('/accounts')).data;
export const createAccount = async (data: any) => (await api.post('/accounts', data)).data;
export const deleteAccount = async (id: string) => (await api.delete(`/accounts/${id}`)).data;

export const getRules = async (accountId?: string) => (await api.get('/rules', { params: { accountId } })).data;
export const createRule = async (data: any) => (await api.post('/rules', data)).data;
export const updateRule = async (id: string, data: any) => (await api.put(`/rules/${id}`, data)).data;
export const deleteRule = async (id: string) => (await api.delete(`/rules/${id}`)).data;
