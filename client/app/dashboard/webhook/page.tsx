'use client';

import { useState } from 'react';
import { Copy, Check, Link2, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const VERIFY_TOKEN = 'my_secret_token';

export default function WebhookPage() {
    const [copied, setCopied] = useState<string | null>(null);
    const webhookUrl = `${API_URL}/webhook`;

    function copy(text: string, key: string) {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }

    const FIELDS = [
        { label: 'Callback URL', value: webhookUrl, key: 'url', color: 'var(--neon-cyan)' },
        { label: 'Verify Token', value: VERIFY_TOKEN, key: 'token', color: 'var(--neon-pink)' },
    ];

    const STEPS = [
        { step: 1, text: '登入 Meta Business Suite → 帳號設定' },
        { step: 2, text: '前往 你的應用程式 → Messenger → Webhooks' },
        { step: 3, text: '點擊「新增 Callback URL」，貼上上方 URL 和 Verify Token' },
        { step: 4, text: '訂閱 messages 事件' },
        { step: 5, text: '確認後，訊息即可自動觸發規則 ✓' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-orbitron text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Webhook 設定</h1>
                <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>將以下資訊填入 Meta 開發者後台以接收訊息</p>
            </div>

            {/* Webhook Info */}
            <div className="glass-card rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <Link2 size={15} style={{ color: 'var(--neon-gold)' }} />
                    <h2 className="font-orbitron text-xs font-bold tracking-widest" style={{ color: 'var(--neon-gold)' }}>Webhook 資訊</h2>
                </div>
                <div className="space-y-4">
                    {FIELDS.map(f => (
                        <div key={f.key}>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 px-4 py-2.5 rounded-lg font-mono text-sm truncate"
                                    style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${f.color}30`, color: f.color }}>
                                    {f.value}
                                </div>
                                <button onClick={() => copy(f.value, f.key)}
                                    className="p-2.5 rounded-lg transition-all flex-shrink-0"
                                    style={{ border: `1px solid ${f.color}40`, color: f.color }}>
                                    {copied === f.key ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Steps */}
            <div className="glass-card rounded-xl p-6 mb-6">
                <h2 className="font-orbitron text-xs font-bold tracking-widest mb-5" style={{ color: 'var(--neon-cyan)' }}>設定步驟</h2>
                <div className="space-y-3">
                    {STEPS.map(s => (
                        <div key={s.step} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-orbitron text-xs font-bold flex-shrink-0 mt-0.5"
                                style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                                {s.step}
                            </span>
                            <p className="font-rajdhani text-sm" style={{ color: 'var(--text-primary)' }}>{s.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* External Link */}
            <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-orbitron text-xs font-bold tracking-widest"
                style={{ border: '1px solid var(--neon-gold)', color: 'var(--neon-gold)' }}>
                <ExternalLink size={14} /> 前往 Meta 開發者後台
            </a>
        </div>
    );
}
