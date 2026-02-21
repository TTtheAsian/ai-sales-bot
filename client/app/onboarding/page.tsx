'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, ChevronRight, Facebook, Settings, MessageSquare, Zap, Copy, Check } from 'lucide-react';

const STEPS = [
    { id: 1, title: '連結社群帳號', desc: '綁定你的 Facebook 或 Instagram 頁面' },
    { id: 2, title: '設定 Webhook', desc: '讓 Meta 能傳送訊息給你的機器人' },
    { id: 3, title: '建立第一條規則', desc: '設定關鍵字與自動回覆內容' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const VERIFY_TOKEN = 'my_secret_token';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    // Step 1 state
    const [pageId, setPageId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [accountSaved, setAccountSaved] = useState(false);

    // Step 3 state
    const [keyword, setKeyword] = useState('');
    const [reply, setReply] = useState('');
    const [ruleSaved, setRuleSaved] = useState(false);

    const webhookUrl = `${API_URL}/webhook`;

    function copyText(text: string, key: string) {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }

    async function saveAccount() {
        if (!pageId || !accessToken) return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/api/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
                body: JSON.stringify({ page_id: pageId, access_token: accessToken }),
            });
            if (res.ok) setAccountSaved(true);
        } catch { /* ignore */ }
        setLoading(false);
    }

    async function saveRule() {
        if (!keyword || !reply) return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const accountsRes = await fetch(`${API_URL}/api/accounts`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            const accounts = await accountsRes.json();
            if (accounts.length > 0) {
                await fetch(`${API_URL}/api/rules`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
                    body: JSON.stringify({ account_id: accounts[0].id, keyword, reply_content: reply, is_active: true }),
                });
            }
            setRuleSaved(true);
        } catch { /* ignore */ }
        setLoading(false);
    }

    async function finish() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').upsert({ id: user.id, onboarding_completed: true });
        }
        router.push('/dashboard/overview');
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <div className="fixed inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(var(--neon-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }} />

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <Zap size={18} style={{ color: 'var(--neon-cyan)' }} />
                        <span className="font-orbitron text-sm font-bold tracking-widest" style={{ color: 'var(--neon-cyan)' }}>
                            SOCIALMANAGER
                        </span>
                    </div>
                    <h1 className="font-orbitron text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                        快速設定精靈
                    </h1>
                    <p className="font-rajdhani" style={{ color: 'var(--text-muted)' }}>3 個步驟，開始自動化你的社群銷售</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-0 mb-10">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-bold transition-all"
                                    style={{
                                        background: s.id < step ? 'var(--neon-cyan)' : s.id === step ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
                                        border: `1.5px solid ${s.id <= step ? 'var(--neon-cyan)' : 'var(--border-muted)'}`,
                                        color: s.id < step ? '#000' : s.id === step ? 'var(--neon-cyan)' : 'var(--text-muted)',
                                    }}>
                                    {s.id < step ? <Check size={14} /> : s.id}
                                </div>
                                <span className="font-rajdhani text-xs hidden sm:block" style={{ color: s.id === step ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>
                                    {s.title}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className="w-16 sm:w-24 h-px mx-2 mb-4"
                                    style={{ background: s.id < step ? 'var(--neon-cyan)' : 'var(--border-muted)' }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="glass-card rounded-xl p-8">
                    {/* ── Step 1: 連結帳號 ── */}
                    {step === 1 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid var(--neon-cyan)' }}>
                                    <Facebook size={18} style={{ color: 'var(--neon-cyan)' }} />
                                </div>
                                <div>
                                    <h2 className="font-orbitron text-sm font-bold" style={{ color: 'var(--neon-cyan)' }}>STEP 1 — 連結社群帳號</h2>
                                    <p className="font-rajdhani text-xs" style={{ color: 'var(--text-muted)' }}>輸入你的 Facebook Page ID 和 Access Token</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Facebook Page ID</label>
                                    <input value={pageId} onChange={e => setPageId(e.target.value)}
                                        placeholder="例：123456789012345"
                                        className="cyber-input w-full px-4 py-3 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Page Access Token</label>
                                    <input value={accessToken} onChange={e => setAccessToken(e.target.value)}
                                        placeholder="EAAxxxx..."
                                        className="cyber-input w-full px-4 py-3 rounded-lg text-sm"
                                        type="password" />
                                    <p className="font-rajdhani text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        從 Meta Business Suite → 設定 → 進階 → 頁面 Access Token 取得
                                    </p>
                                </div>
                            </div>

                            {accountSaved ? (
                                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg font-rajdhani text-sm"
                                    style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                                    <CheckCircle size={15} /> 帳號已成功連結！
                                </div>
                            ) : (
                                <button onClick={saveAccount} disabled={loading || !pageId || !accessToken}
                                    className="btn-solid-cyan w-full py-3 rounded-lg font-orbitron text-xs font-bold tracking-widest mb-4 disabled:opacity-40">
                                    {loading ? '連結中...' : '連結帳號'}
                                </button>
                            )}

                            <div className="flex justify-between mt-2">
                                <button onClick={() => setStep(2)} className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>
                                    稍後設定 →
                                </button>
                                {accountSaved && (
                                    <button onClick={() => setStep(2)}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg font-orbitron text-xs font-bold"
                                        style={{ background: 'var(--neon-cyan)', color: '#000' }}>
                                        下一步 <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Webhook 設定 ── */}
                    {step === 2 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid var(--neon-pink)' }}>
                                    <Settings size={18} style={{ color: 'var(--neon-pink)' }} />
                                </div>
                                <div>
                                    <h2 className="font-orbitron text-sm font-bold" style={{ color: 'var(--neon-pink)' }}>STEP 2 — 設定 Webhook</h2>
                                    <p className="font-rajdhani text-xs" style={{ color: 'var(--text-muted)' }}>將以下資訊填入 Meta 開發者後台</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                {[
                                    { label: 'Callback URL', value: webhookUrl, key: 'url' },
                                    { label: 'Verify Token', value: VERIFY_TOKEN, key: 'token' },
                                ].map(item => (
                                    <div key={item.key}>
                                        <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{item.label}</label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 px-4 py-2.5 rounded-lg font-mono text-xs truncate"
                                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }}>
                                                {item.value}
                                            </div>
                                            <button onClick={() => copyText(item.value, item.key)}
                                                className="flex-shrink-0 p-2.5 rounded-lg transition-all"
                                                style={{ border: '1px solid var(--border-cyan)', color: 'var(--neon-cyan)' }}>
                                                {copied === item.key ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 rounded-lg mb-6" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)' }}>
                                <p className="font-rajdhani text-xs" style={{ color: 'var(--neon-gold)' }}>
                                    📖 前往 <strong>Meta 開發者後台 → 你的應用程式 → Messenger → Webhooks</strong>，
                                    貼上以上資訊並訂閱 <strong>messages</strong> 事件。
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>← 上一步</button>
                                <button onClick={() => setStep(3)}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg font-orbitron text-xs font-bold"
                                    style={{ background: 'var(--neon-pink)', color: '#fff' }}>
                                    下一步 <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: 第一條規則 ── */}
                    {step === 3 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid var(--neon-cyan)' }}>
                                    <MessageSquare size={18} style={{ color: 'var(--neon-cyan)' }} />
                                </div>
                                <div>
                                    <h2 className="font-orbitron text-sm font-bold" style={{ color: 'var(--neon-cyan)' }}>STEP 3 — 建立第一條規則</h2>
                                    <p className="font-rajdhani text-xs" style={{ color: 'var(--text-muted)' }}>當用戶傳送關鍵字時，自動回覆指定內容</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>觸發關鍵字</label>
                                    <input value={keyword} onChange={e => setKeyword(e.target.value)}
                                        placeholder="例：價格、報價、購買"
                                        className="cyber-input w-full px-4 py-3 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>自動回覆內容</label>
                                    <textarea value={reply} onChange={e => setReply(e.target.value)}
                                        placeholder="你好！感謝您的詢問，我們的價格為..."
                                        rows={4}
                                        className="cyber-input w-full px-4 py-3 rounded-lg text-sm resize-none" />
                                </div>
                            </div>

                            {ruleSaved ? (
                                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg font-rajdhani text-sm"
                                    style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                                    <CheckCircle size={15} /> 規則已建立！
                                </div>
                            ) : (
                                <button onClick={saveRule} disabled={loading || !keyword || !reply}
                                    className="btn-solid-cyan w-full py-3 rounded-lg font-orbitron text-xs font-bold tracking-widest mb-4 disabled:opacity-40">
                                    {loading ? '儲存中...' : '儲存規則'}
                                </button>
                            )}

                            <div className="flex justify-between mt-2">
                                <button onClick={() => setStep(2)} className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>← 上一步</button>
                                <button onClick={finish}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-orbitron text-xs font-black"
                                    style={{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-pink))', color: '#000' }}>
                                    進入主控台 <Zap size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
