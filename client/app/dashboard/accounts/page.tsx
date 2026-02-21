'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Smartphone, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface Account { id: string; page_id: string; access_token: string; created_at: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [pageId, setPageId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [showToken, setShowToken] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

    const getHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` };
    };

    const load = useCallback(async () => {
        const h = await getHeaders();
        const res = await fetch(`${API_URL}/api/accounts`, { headers: h });
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function addAccount(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const h = await getHeaders();
        const res = await fetch(`${API_URL}/api/accounts`, {
            method: 'POST', headers: h,
            body: JSON.stringify({ page_id: pageId, access_token: accessToken }),
        });
        if (res.ok) { setMsg({ text: '帳號已連結！', type: 'ok' }); setPageId(''); setAccessToken(''); load(); }
        else { setMsg({ text: '連結失敗，請確認資訊是否正確', type: 'err' }); }
        setLoading(false);
        setTimeout(() => setMsg(null), 3000);
    }

    async function deleteAccount(id: string) {
        const h = await getHeaders();
        await fetch(`${API_URL}/api/accounts/${id}`, { method: 'DELETE', headers: h });
        load();
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-orbitron text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>帳號管理</h1>
                <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>連結你的 Facebook / Instagram 頁面</p>
            </div>

            {/* Add Account */}
            <div className="glass-card rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <Plus size={15} style={{ color: 'var(--neon-cyan)' }} />
                    <h2 className="font-orbitron text-xs font-bold tracking-widest" style={{ color: 'var(--neon-cyan)' }}>連結新帳號</h2>
                </div>
                <form onSubmit={addAccount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Facebook Page ID</label>
                            <input value={pageId} onChange={e => setPageId(e.target.value)}
                                placeholder="例：123456789012345"
                                className="cyber-input w-full px-4 py-2.5 rounded-lg text-sm" required />
                        </div>
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Page Access Token</label>
                            <input value={accessToken} onChange={e => setAccessToken(e.target.value)}
                                placeholder="EAAxxxx..." type="password"
                                className="cyber-input w-full px-4 py-2.5 rounded-lg text-sm" required />
                        </div>
                    </div>
                    {msg && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-rajdhani"
                            style={{
                                background: msg.type === 'ok' ? 'rgba(0,245,255,0.08)' : 'rgba(255,0,110,0.08)',
                                border: `1px solid ${msg.type === 'ok' ? 'var(--neon-cyan)' : 'var(--neon-pink)'}`,
                                color: msg.type === 'ok' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
                            }}>
                            {msg.type === 'ok' ? <CheckCircle size={12} /> : null} {msg.text}
                        </div>
                    )}
                    <button type="submit" disabled={loading}
                        className="btn-solid-cyan px-6 py-2.5 rounded-lg font-orbitron text-xs font-bold tracking-widest disabled:opacity-40">
                        {loading ? '連結中...' : '+ 連結帳號'}
                    </button>
                </form>
            </div>

            {/* Accounts List */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                    <div className="flex items-center gap-2">
                        <Smartphone size={15} style={{ color: 'var(--neon-cyan)' }} />
                        <span className="font-orbitron text-xs font-bold tracking-widest" style={{ color: 'var(--neon-cyan)' }}>
                            已連結帳號 ({accounts.length})
                        </span>
                    </div>
                </div>

                {accounts.length === 0 ? (
                    <div className="text-center py-12">
                        <Smartphone size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--neon-cyan)' }} />
                        <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>尚未連結任何帳號</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                        {accounts.map(acc => (
                            <div key={acc.id} className="px-6 py-4 flex items-center gap-4">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid var(--border-cyan)' }}>
                                    <Smartphone size={15} style={{ color: 'var(--neon-cyan)' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{acc.page_id}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {showToken[acc.id] ? acc.access_token : acc.access_token.slice(0, 12) + '••••••••'}
                                        </span>
                                        <button onClick={() => setShowToken(p => ({ ...p, [acc.id]: !p[acc.id] }))}>
                                            {showToken[acc.id] ? <EyeOff size={11} style={{ color: 'var(--text-muted)' }} /> : <Eye size={11} style={{ color: 'var(--text-muted)' }} />}
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => deleteAccount(acc.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 transition-all flex-shrink-0">
                                    <Trash2 size={14} style={{ color: 'var(--neon-pink)' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
