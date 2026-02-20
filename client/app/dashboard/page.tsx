'use client';

import { useEffect, useState } from 'react';
import { getAccounts, createAccount, getRules, createRule, deleteRule, api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Activity, Instagram, Key, MessageSquare, Plus, Trash2, Save, Wifi } from 'lucide-react';


export default function Dashboard() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [status, setStatus] = useState<'online' | 'offline'>('offline');

    // Form states
    const [pageId, setPageId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [keyword, setKeyword] = useState('');
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        loadAccounts();
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            await api.get('/'); // Health check
            setStatus('online');
        } catch (e) {
            setStatus('offline');
        }
    };

    useEffect(() => {
        if (selectedAccount) {
            loadRules(selectedAccount);
        }
    }, [selectedAccount]);

    const loadAccounts = async () => {
        try {
            const data = await getAccounts();
            setAccounts(data);
            if (data.length > 0) setSelectedAccount(data[0].id);
        } catch (e) {
            console.error(e);
        }
    };

    const loadRules = async (accountId: string) => {
        try {
            const data = await getRules(accountId);
            setRules(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAccount({ page_id: pageId, access_token: accessToken });
            setPageId('');
            setAccessToken('');
            loadAccounts();
        } catch (e) {
            alert('Failed to add account');
        }
    };

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount) return;
        try {
            await createRule({ account_id: selectedAccount, keyword, reply_content: replyContent });
            setKeyword('');
            setReplyContent('');
            loadRules(selectedAccount);
        } catch (e) {
            alert('Failed to add rule');
        }
    };

    const handleDeleteRule = async (id: string) => {
        try {
            await deleteRule(id);
            if (selectedAccount) loadRules(selectedAccount);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-cyan-400 font-mono p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                    AI Sales Bot Dashboard
                </h1>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                    <span className={`font-bold flex items-center gap-2 ${status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                        {status === 'online' ? <Wifi size={18} /> : <Activity size={18} />}
                        {status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Account Setup Section */}
                <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <h2 className="text-2xl mb-4 border-b border-cyan-500/30 pb-2 flex items-center gap-2">
                        <Instagram className="text-cyan-400" /> 1. Connect Account
                    </h2>
                    <form onSubmit={handleAddAccount} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">Page ID</label>
                            <input
                                type="text"
                                value={pageId}
                                onChange={(e) => setPageId(e.target.value)}
                                className="w-full bg-gray-900 border border-cyan-500/50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="e.g. 100500..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Access Token</label>
                            <input
                                type="text"
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                className="w-full bg-gray-900 border border-cyan-500/50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="EAAG..."
                            />
                        </div>
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded transition-all flex justify-center items-center gap-2">
                            <Plus size={18} /> Link Account
                        </button>
                    </form>

                    <div className="mt-6">
                        <h3 className="text-lg mb-2">Connected Accounts:</h3>
                        <ul className="space-y-2">
                            {accounts.map(acc => (
                                <li
                                    key={acc.id}
                                    className={`p-2 cursor-pointer border rounded ${selectedAccount === acc.id ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-700'}`}
                                    onClick={() => setSelectedAccount(acc.id)}
                                >
                                    Page ID: {acc.page_id}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Rule Management Section */}
                <div className="bg-gray-800 p-6 rounded-lg border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <h2 className="text-2xl mb-4 border-b border-purple-500/30 pb-2 text-purple-400">2. Manage Rules</h2>

                    {!selectedAccount ? (
                        <p className="text-gray-500">Select an account to manage rules.</p>
                    ) : (
                        <>
                            <form onSubmit={handleAddRule} className="mb-6 space-y-4">
                                <div>
                                    <label className="block text-sm mb-1">Keyword</label>
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="w-full bg-gray-900 border border-purple-500/50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="price, shipping..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Reply Content</label>
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        className="w-full bg-gray-900 border border-purple-500/50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                                        placeholder="Our price is $..."
                                    />
                                </div>
                                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-all">
                                    Add Rule
                                </button>
                            </form>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="p-2">Keyword</th>
                                            <th className="p-2">Reply</th>
                                            <th className="p-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rules.map(rule => (
                                            <tr key={rule.id} className="border-b border-gray-800 hover:bg-gray-700/50">
                                                <td className="p-2 font-bold text-cyan-300">{rule.keyword}</td>
                                                <td className="p-2 text-gray-300 truncate max-w-xs">{rule.reply_content}</td>
                                                <td className="p-2">
                                                    <button
                                                        onClick={() => handleDeleteRule(rule.id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
