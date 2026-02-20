'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    getAccounts, createAccount, deleteAccount,
    getRules, createRule, updateRule, deleteRule,
    api
} from '@/lib/api';
import {
    Activity, Instagram, Wifi, WifiOff, Plus, Trash2,
    ChevronDown, ChevronUp, Copy, CheckCircle, AlertCircle,
    RefreshCw, Radio, Zap, MessageSquare, Settings,
    ExternalLink, Eye, EyeOff, ToggleLeft, ToggleRight
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
interface Account {
    id: string;
    page_id: string;
    access_token: string;
    webhook_secret?: string;
    created_at?: string;
}

interface Rule {
    id: string;
    account_id: string;
    keyword: string;
    reply_content: string;
    is_active: boolean;
    created_at?: string;
}

// ─── Toast ───────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const colors = {
        success: { border: 'var(--neon-green)', icon: <CheckCircle size={16} /> },
        error: { border: 'var(--neon-pink)', icon: <AlertCircle size={16} /> },
        info: { border: 'var(--neon-cyan)', icon: <Radio size={16} /> },
    };
    const c = colors[type];
    return (
        <div className="toast flex items-center gap-3 px-5 py-3 rounded-lg font-rajdhani text-sm"
            style={{
                background: 'var(--bg-secondary)',
                border: `1px solid ${c.border}`,
                boxShadow: `0 0 20px ${c.border}40`,
                color: c.border,
            }}>
            {c.icon}
            <span style={{ color: 'var(--text-primary)' }}>{message}</span>
        </div>
    );
}

// ─── Section Header ───────────────────────────────────────
function SectionHeader({ icon: Icon, title, accent = 'cyan', badge }: {
    icon: React.ElementType; title: string; accent?: 'cyan' | 'pink' | 'gold'; badge?: number;
}) {
    const colorMap = {
        cyan: 'var(--neon-cyan)',
        pink: 'var(--neon-pink)',
        gold: 'var(--neon-gold)',
    };
    const color = colorMap[accent];
    return (
        <div className="flex items-center gap-3 mb-5 pb-3"
            style={{ borderBottom: `1px solid ${color}22` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
                <Icon size={16} style={{ color }} />
            </div>
            <h2 className="font-orbitron text-sm font-bold tracking-widest" style={{ color }}>
                {title}
            </h2>
            {badge !== undefined && (
                <span className="ml-auto font-mono-jp text-xs px-2 py-0.5 rounded"
                    style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}>
                    {badge}
                </span>
            )}
        </div>
    );
}

// ─── CopyButton ───────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} className="p-1.5 rounded transition-all"
            style={{ color: copied ? 'var(--neon-green)' : 'var(--text-muted)' }}
            title="複製">
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
        </button>
    );
}

// ─── Main Dashboard ───────────────────────────────────────
export default function Dashboard() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');
    const [loading, setLoading] = useState({ accounts: false, rules: false });

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') =>
        setToast({ message, type });

    // Form states
    const [pageId, setPageId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [addingAccount, setAddingAccount] = useState(false);
    const [addingRule, setAddingRule] = useState(false);

    // API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const checkStatus = useCallback(async () => {
        try {
            await api.get('/');
            setStatus('online');
        } catch {
            setStatus('offline');
        }
    }, []);

    const loadAccounts = useCallback(async () => {
        setLoading(l => ({ ...l, accounts: true }));
        try {
            const data = await getAccounts();
            setAccounts(data);
            if (data.length > 0 && !selectedAccount) setSelectedAccount(data[0]);
        } catch {
            showToast('無法載入帳號列表', 'error');
        } finally {
            setLoading(l => ({ ...l, accounts: false }));
        }
    }, [selectedAccount]);

    const loadRules = useCallback(async (accountId: string) => {
        setLoading(l => ({ ...l, rules: true }));
        try {
            const data = await getRules(accountId);
            setRules(data);
        } catch {
            showToast('無法載入規則列表', 'error');
        } finally {
            setLoading(l => ({ ...l, rules: false }));
        }
    }, []);

    useEffect(() => {
        checkStatus();
        loadAccounts();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedAccount) loadRules(selectedAccount.id);
        else setRules([]);
    }, [selectedAccount]);

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pageId.trim() || !accessToken.trim()) return;
        setAddingAccount(true);
        try {
            await createAccount({ page_id: pageId.trim(), access_token: accessToken.trim() });
            setPageId(''); setAccessToken('');
            await loadAccounts();
            showToast('帳號已成功連結！', 'success');
        } catch {
            showToast('無法新增帳號，請確認 API 連線', 'error');
        } finally {
            setAddingAccount(false);
        }
    };

    const handleDeleteAccount = async (id: string) => {
        if (!confirm('確定刪除此帳號及其所有規則？')) return;
        try {
            await deleteAccount(id);
            if (selectedAccount?.id === id) setSelectedAccount(null);
            await loadAccounts();
            showToast('帳號已刪除', 'info');
        } catch {
            showToast('刪除失敗', 'error');
        }
    };

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount || !keyword.trim() || !replyContent.trim()) return;
        setAddingRule(true);
        try {
            await createRule({ account_id: selectedAccount.id, keyword: keyword.trim(), reply_content: replyContent.trim() });
            setKeyword(''); setReplyContent('');
            await loadRules(selectedAccount.id);
            showToast('規則已新增！', 'success');
        } catch {
            showToast('新增規則失敗', 'error');
        } finally {
            setAddingRule(false);
        }
    };

    const handleToggleRule = async (rule: Rule) => {
        try {
            await updateRule(rule.id, { is_active: !rule.is_active });
            setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
        } catch {
            showToast('切換失敗', 'error');
        }
    };

    const handleDeleteRule = async (id: string) => {
        try {
            await deleteRule(id);
            setRules(prev => prev.filter(r => r.id !== id));
            showToast('規則已刪除', 'info');
        } catch {
            showToast('刪除失敗', 'error');
        }
    };

    const webhookUrl = selectedAccount ? `${apiBaseUrl}/webhook` : '';
    const verifyToken = 'my_secret_token';

    return (
        <div className="min-h-screen cyber-grid" style={{ background: 'var(--bg-primary)' }}>
            {/* Toast */}
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
                style={{
                    background: 'rgba(4, 8, 16, 0.92)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid var(--border-cyan)',
                }}>
                <div className="flex items-center gap-3">
                    <Radio size={20} style={{ color: 'var(--neon-cyan)' }} className="animate-pulse" />
                    <span className="font-orbitron text-sm font-bold tracking-widest" style={{ color: 'var(--neon-cyan)' }}>
                        SOCIAL<span style={{ color: 'var(--text-secondary)' }}>MANAGER</span>
                    </span>
                    <span className="hidden md:inline ml-4 font-mono-jp text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid var(--border-cyan)', color: 'var(--text-muted)' }}>
                        DASHBOARD
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-green-400 pulse-online' : status === 'offline' ? 'bg-red-500 pulse-offline' : 'bg-yellow-400'}`} />
                        <span className="font-mono-jp text-xs" style={{ color: status === 'online' ? 'var(--neon-green)' : status === 'offline' ? 'var(--neon-pink)' : 'var(--neon-gold)' }}>
                            {status === 'checking' ? (
                                <RefreshCw size={12} className="animate-spin" />
                            ) : (
                                status === 'online' ? 'API ONLINE' : 'API OFFLINE'
                            )}
                        </span>
                    </div>

                    <button onClick={checkStatus}
                        className="p-1.5 rounded transition-all hover:bg-cyan-500/10"
                        style={{ color: 'var(--text-muted)' }} title="重新檢查連線">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </nav>

            {/* Main Grid */}
            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* ── Panel 1: Connect Account ── */}
                <div className="glass-card rounded-xl p-6">
                    <SectionHeader icon={Instagram} title="CONNECT ACCOUNT" accent="cyan" badge={accounts.length} />

                    <form onSubmit={handleAddAccount} className="space-y-4 mb-6">
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                PAGE ID
                            </label>
                            <input
                                type="text"
                                value={pageId}
                                onChange={e => setPageId(e.target.value)}
                                className="cyber-input w-full px-3 py-2.5 rounded-lg text-sm"
                                placeholder="100500xxxxxxx"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                ACCESS TOKEN
                            </label>
                            <div className="relative">
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    value={accessToken}
                                    onChange={e => setAccessToken(e.target.value)}
                                    className="cyber-input w-full px-3 py-2.5 rounded-lg text-sm pr-10"
                                    placeholder="EAAG..."
                                    required
                                />
                                <button type="button" onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: 'var(--text-muted)' }}>
                                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={addingAccount}
                            className="btn-cyan w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                            {addingAccount ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                            {addingAccount ? '連結中...' : '連結帳號'}
                        </button>
                    </form>

                    {/* Account List */}
                    <div className="space-y-2">
                        {loading.accounts ? (
                            <div className="text-center py-6">
                                <RefreshCw size={20} className="animate-spin mx-auto mb-2" style={{ color: 'var(--neon-cyan)' }} />
                                <p className="font-mono-jp text-xs" style={{ color: 'var(--text-muted)' }}>載入帳號...</p>
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="text-center py-6 rounded-lg"
                                style={{ background: 'rgba(0,245,255,0.03)', border: '1px dashed var(--border-cyan)' }}>
                                <Instagram size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                                <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>尚無連結帳號</p>
                            </div>
                        ) : (
                            accounts.map(acc => (
                                <div
                                    key={acc.id}
                                    onClick={() => setSelectedAccount(acc)}
                                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
                                    style={{
                                        background: selectedAccount?.id === acc.id ? 'rgba(0,245,255,0.1)' : 'rgba(0,245,255,0.02)',
                                        border: `1px solid ${selectedAccount?.id === acc.id ? 'var(--neon-cyan)' : 'var(--border-cyan)'}`,
                                        boxShadow: selectedAccount?.id === acc.id ? '0 0 12px rgba(0,245,255,0.2)' : 'none',
                                    }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--neon-green)' }} />
                                        <div>
                                            <p className="font-mono-jp text-xs" style={{ color: 'var(--neon-cyan)' }}>{acc.page_id}</p>
                                            <p className="font-mono-jp text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {'•'.repeat(8) + acc.access_token.slice(-4)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteAccount(acc.id); }}
                                        className="p-1.5 rounded transition-colors hover:bg-red-500/20"
                                        style={{ color: 'var(--text-muted)' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Panel 2: Webhook Info ── */}
                <div className="glass-card rounded-xl p-6">
                    <SectionHeader icon={Zap} title="WEBHOOK CONFIG" accent="gold" />

                    {!selectedAccount ? (
                        <div className="text-center py-12">
                            <Settings size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                            <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>
                                請先選擇左側帳號
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Status badge */}
                            <div className="flex items-center gap-2 p-3 rounded-lg"
                                style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)' }}>
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                                    style={{ boxShadow: '0 0 6px var(--neon-green)' }} />
                                <span className="font-orbitron text-xs" style={{ color: 'var(--neon-green)' }}>
                                    WEBHOOK ACTIVE
                                </span>
                            </div>

                            {/* Webhook URL */}
                            <div>
                                <p className="font-mono-jp text-xs mb-2" style={{ color: 'var(--text-muted)' }}>CALLBACK URL</p>
                                <div className="flex items-center gap-2 p-3 rounded-lg"
                                    style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid var(--border-cyan)' }}>
                                    <ExternalLink size={12} style={{ color: 'var(--neon-cyan)' }} className="shrink-0" />
                                    <code className="font-mono-jp text-xs flex-1 truncate" style={{ color: 'var(--neon-cyan)' }}>
                                        {webhookUrl}
                                    </code>
                                    <CopyButton text={webhookUrl} />
                                </div>
                            </div>

                            {/* Verify Token */}
                            <div>
                                <p className="font-mono-jp text-xs mb-2" style={{ color: 'var(--text-muted)' }}>VERIFY TOKEN</p>
                                <div className="flex items-center gap-2 p-3 rounded-lg"
                                    style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.25)' }}>
                                    <code className="font-mono-jp text-xs flex-1" style={{ color: 'var(--neon-gold)' }}>
                                        {verifyToken}
                                    </code>
                                    <CopyButton text={verifyToken} />
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="rounded-lg p-4 space-y-2"
                                style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid var(--border-cyan)' }}>
                                <p className="font-orbitron text-xs" style={{ color: 'var(--neon-cyan)' }}>設定步驟</p>
                                {[
                                    '前往 Meta Business Suite',
                                    '設定 → Webhooks → 新增 Webhook',
                                    '貼上上方 Callback URL',
                                    '輸入 Verify Token 並訂閱 messages 事件',
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="font-orbitron text-xs w-4 shrink-0"
                                            style={{ color: 'var(--neon-gold)' }}>{i + 1}.</span>
                                        <p className="font-rajdhani text-sm" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Panel 3: Add Rule ── */}
                <div className="glass-card-pink rounded-xl p-6">
                    <SectionHeader icon={Plus} title="ADD RULE" accent="pink" />

                    {!selectedAccount ? (
                        <div className="text-center py-12">
                            <MessageSquare size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                            <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>
                                請先選擇帳號
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleAddRule} className="space-y-4">
                            <div>
                                <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    關鍵字 KEYWORD
                                </label>
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm font-rajdhani"
                                    style={{
                                        background: 'rgba(255,0,110,0.04)',
                                        border: '1px solid var(--border-pink)',
                                        color: 'var(--neon-pink)',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = 'var(--neon-pink)';
                                        e.currentTarget.style.boxShadow = '0 0 10px rgba(255,0,110,0.3)';
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-pink)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    placeholder="price, shipping, 價格..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    自動回覆內容 REPLY
                                </label>
                                <textarea
                                    value={replyContent}
                                    onChange={e => setReplyContent(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm font-rajdhani resize-none"
                                    style={{
                                        background: 'rgba(255,0,110,0.04)',
                                        border: '1px solid var(--border-pink)',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        height: '120px',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = 'var(--neon-pink)';
                                        e.currentTarget.style.boxShadow = '0 0 10px rgba(255,0,110,0.3)';
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-pink)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    placeholder="您好！我們的價格是..."
                                    required
                                />
                            </div>
                            <button type="submit" disabled={addingRule}
                                className="btn-pink w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                                {addingRule ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                                {addingRule ? '新增中...' : '新增規則'}
                            </button>
                        </form>
                    )}
                </div>

                {/* ── Panel 4: Rules Table (full width) ── */}
                <div className="glass-card rounded-xl p-6 lg:col-span-2 xl:col-span-3">
                    <SectionHeader icon={MessageSquare} title="AUTO-REPLY RULES" accent="cyan" badge={rules.length} />

                    {!selectedAccount ? (
                        <div className="text-center py-10">
                            <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>
                                請選擇左側帳號來查看規則
                            </p>
                        </div>
                    ) : loading.rules ? (
                        <div className="text-center py-10">
                            <RefreshCw size={24} className="animate-spin mx-auto mb-2" style={{ color: 'var(--neon-cyan)' }} />
                            <p className="font-mono-jp text-xs" style={{ color: 'var(--text-muted)' }}>載入規則...</p>
                        </div>
                    ) : rules.length === 0 ? (
                        <div className="text-center py-10 rounded-xl"
                            style={{ background: 'rgba(0,245,255,0.02)', border: '1px dashed var(--border-cyan)' }}>
                            <MessageSquare size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                            <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>此帳號尚無自動回覆規則</p>
                            <p className="font-rajdhani text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                使用右上方面板新增第一條規則
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-cyan)' }}>
                                        {['狀態', '關鍵字', '自動回覆內容', '操作'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 font-orbitron text-xs"
                                                style={{ color: 'var(--text-muted)' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rules.map((rule, i) => (
                                        <tr key={rule.id}
                                            className="transition-colors"
                                            style={{
                                                borderBottom: '1px solid rgba(0,245,255,0.06)',
                                                background: i % 2 === 0 ? 'transparent' : 'rgba(0,245,255,0.01)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(0,245,255,0.01)'}
                                        >
                                            {/* Toggle */}
                                            <td className="px-4 py-3">
                                                <label className="toggle-switch cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={rule.is_active}
                                                        onChange={() => handleToggleRule(rule)}
                                                    />
                                                    <span className="toggle-slider" />
                                                </label>
                                            </td>
                                            {/* Keyword */}
                                            <td className="px-4 py-3">
                                                <span className="font-mono-jp text-sm px-2 py-1 rounded"
                                                    style={{
                                                        background: 'rgba(0,245,255,0.08)',
                                                        color: rule.is_active ? 'var(--neon-cyan)' : 'var(--text-muted)',
                                                        border: '1px solid rgba(0,245,255,0.2)',
                                                    }}>
                                                    {rule.keyword}
                                                </span>
                                            </td>
                                            {/* Reply */}
                                            <td className="px-4 py-3 max-w-xs">
                                                <p className="font-rajdhani text-sm truncate"
                                                    style={{ color: rule.is_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                    {rule.reply_content}
                                                </p>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="p-1.5 rounded transition-all hover:bg-red-500/20"
                                                    style={{ color: 'var(--text-muted)' }}
                                                    title="刪除規則">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* Footer */}
            <footer className="text-center py-5 mt-4 border-t"
                style={{ borderColor: 'var(--border-cyan)' }}>
                <p className="font-mono-jp text-xs" style={{ color: 'var(--text-muted)' }}>
                    SocialManager v2.0 — AI-Powered Auto-Reply Bot
                    <span className="mx-3" style={{ color: 'var(--border-cyan)' }}>|</span>
                    {new Date().getFullYear()} © All rights reserved
                </p>
            </footer>
        </div>
    );
}
