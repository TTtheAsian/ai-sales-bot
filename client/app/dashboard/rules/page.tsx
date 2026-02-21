'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, MessageSquare, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';

interface Rule {
    id: string;
    keyword: string;
    reply_content: string;
    is_active: boolean;
    account_id: string;
    actions?: { type: string; value: string }[];
}
interface Account { id: string; page_id: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RulesPage() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [keyword, setKeyword] = useState('');
    const [reply, setReply] = useState('');
    const [tagToAdd, setTagToAdd] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

    const getHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` };
    };

    const load = useCallback(async () => {
        const h = await getHeaders();
        const [acc, r] = await Promise.all([
            fetch(`${API_URL}/api/accounts`, { headers: h }).then(res => res.json()),
            fetch(`${API_URL}/api/rules`, { headers: h }).then(res => res.json()),
        ]);
        setAccounts(Array.isArray(acc) ? acc : []);
        setRules(Array.isArray(r) ? r : []);
        if (acc.length > 0 && !selectedAccount) setSelectedAccount(acc[0].id);
    }, [selectedAccount]);

    useEffect(() => { load(); }, [load]);

    async function addRule(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const h = await getHeaders();

        const actions = tagToAdd ? [{ type: 'add_tag', value: tagToAdd }] : [];

        const res = await fetch(`${API_URL}/api/rules`, {
            method: 'POST', headers: h,
            body: JSON.stringify({
                account_id: selectedAccount,
                keyword,
                reply_content: reply,
                is_active: true,
                actions: actions
            }),
        });
        if (res.ok) {
            setMsg({ text: '規則已新增！', type: 'ok' });
            setKeyword('');
            setReply('');
            setTagToAdd('');
            load();
        }
        else { setMsg({ text: '新增失敗', type: 'err' }); }
        setLoading(false);
        setTimeout(() => setMsg(null), 3000);
    }

    async function toggleRule(rule: Rule) {
        const h = await getHeaders();
        await fetch(`${API_URL}/api/rules/${rule.id}`, {
            method: 'PUT', headers: h,
            body: JSON.stringify({ ...rule, is_active: !rule.is_active }),
        });
        load();
    }

    async function deleteRule(id: string) {
        const h = await getHeaders();
        await fetch(`${API_URL}/api/rules/${id}`, { method: 'DELETE', headers: h });
        load();
    }

    const filteredRules = rules.filter(r => !selectedAccount || r.account_id === selectedAccount);

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-orbitron text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>自動回覆規則</h1>
                <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>設定關鍵字觸發條件與自動回覆內容</p>
            </div>

            {/* Add Rule Form */}
            <div className="glass-card rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <Plus size={15} style={{ color: 'var(--neon-pink)' }} />
                    <h2 className="font-orbitron text-xs font-bold tracking-widest" style={{ color: 'var(--neon-pink)' }}>新增規則</h2>
                </div>

                <form onSubmit={addRule} className="space-y-4">
                    {accounts.length > 1 && (
                        <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}
                            className="cyber-input w-full px-4 py-2.5 rounded-lg text-sm">
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.page_id}</option>)}
                        </select>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>觸發關鍵字</label>
                            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="例：價格、報價"
                                className="cyber-input w-full px-4 py-2.5 rounded-lg text-sm" required />
                        </div>
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>自動回覆內容</label>
                            <input value={reply} onChange={e => setReply(e.target.value)} placeholder="你好！我們的價格是..."
                                className="cyber-input w-full px-4 py-2.5 rounded-lg text-sm" required />
                        </div>
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--neon-purple)' }}>自動標籤 (選填)</label>
                            <input value={tagToAdd} onChange={e => setTagToAdd(e.target.value)} placeholder="例：詢價、買家"
                                className="cyber-input w-full px-4 py-2.5 rounded-lg text-sm" style={{ borderColor: 'rgba(191, 0, 255, 0.3)' }} />
                        </div>
                    </div>

                    {msg && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-rajdhani"
                            style={{
                                background: msg.type === 'ok' ? 'rgba(0,245,255,0.08)' : 'rgba(255,0,110,0.08)',
                                border: `1px solid ${msg.type === 'ok' ? 'var(--neon-cyan)' : 'var(--neon-pink)'}`,
                                color: msg.type === 'ok' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
                            }}>
                            <AlertCircle size={12} /> {msg.text}
                        </div>
                    )}

                    <button type="submit" disabled={loading || !selectedAccount}
                        className="btn-solid-cyan px-6 py-2.5 rounded-lg font-orbitron text-xs font-bold tracking-widest disabled:opacity-40">
                        {loading ? '儲存中...' : '+ 新增規則'}
                    </button>
                </form>
            </div>

            {/* Rules List */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                    <div className="flex items-center gap-2">
                        <MessageSquare size={15} style={{ color: 'var(--neon-cyan)' }} />
                        <span className="font-orbitron text-xs font-bold tracking-widest" style={{ color: 'var(--neon-cyan)' }}>
                            規則列表 ({filteredRules.length})
                        </span>
                    </div>
                </div>

                {filteredRules.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--neon-cyan)' }} />
                        <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>
                            {accounts.length === 0 ? '請先連結帳號' : '尚未建立任何規則'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                        {filteredRules.map(rule => (
                            <div key={rule.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold"
                                            style={{ background: 'rgba(0,245,255,0.1)', color: 'var(--neon-cyan)', border: '1px solid var(--border-cyan)' }}>
                                            {rule.keyword}
                                        </span>
                                        {rule.actions?.map((act, i) => act.type === 'add_tag' && (
                                            <span key={i} className="px-2 py-0.5 rounded font-rajdhani text-[10px] text-purple-400 border border-purple-500/30 bg-purple-500/5">
                                                +{act.value}
                                            </span>
                                        ))}
                                        {!rule.is_active && (
                                            <span className="px-2 py-0.5 rounded font-rajdhani text-xs"
                                                style={{ background: 'rgba(255,0,110,0.1)', color: 'var(--neon-pink)' }}>
                                                已停用
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-rajdhani text-sm truncate" style={{ color: 'var(--text-muted)' }}>{rule.reply_content}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => toggleRule(rule)} className="p-1.5 rounded-lg transition-all"
                                        title={rule.is_active ? '停用' : '啟用'}>
                                        {rule.is_active
                                            ? <ToggleRight size={20} style={{ color: 'var(--neon-cyan)' }} />
                                            : <ToggleLeft size={20} style={{ color: 'var(--text-muted)' }} />}
                                    </button>
                                    <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded-lg transition-all hover:bg-red-500/10">
                                        <Trash2 size={14} style={{ color: 'var(--neon-pink)' }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
