'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, MessageSquare, Smartphone, Zap, TrendingUp, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OverviewPage() {
    const [stats, setStats] = useState({ accounts: 0, rules: 0, active: 0, unmatched: 0 });
    const [unmatched, setUnmatched] = useState<{ message: string; received_at: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const h = { Authorization: `Bearer ${session?.access_token}` };
        const [acc, rules] = await Promise.all([
            fetch(`${API_URL}/api/accounts`, { headers: h }).then(r => r.json()),
            fetch(`${API_URL}/api/rules`, { headers: h }).then(r => r.json()),
        ]);
        const unmatch = acc.length > 0
            ? await fetch(`${API_URL}/api/accounts/unmatched?accountId=${acc[0]?.id}`, { headers: h }).then(r => r.json()).catch(() => [])
            : [];

        setStats({
            accounts: Array.isArray(acc) ? acc.length : 0,
            rules: Array.isArray(rules) ? rules.length : 0,
            active: Array.isArray(rules) ? rules.filter((r: { is_active: boolean }) => r.is_active).length : 0,
            unmatched: Array.isArray(unmatch) ? unmatch.length : 0,
        });
        setUnmatched(Array.isArray(unmatch) ? unmatch.slice(0, 5) : []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const STAT_CARDS = [
        { label: '已連結帳號', value: stats.accounts, icon: Smartphone, color: 'var(--neon-cyan)' },
        { label: '自動回覆規則', value: stats.rules, icon: MessageSquare, color: 'var(--neon-pink)' },
        { label: '啟用中規則', value: stats.active, icon: Zap, color: 'var(--neon-green, #00ff88)' },
        { label: '未匹配訊息', value: stats.unmatched, icon: TrendingUp, color: 'var(--neon-gold)' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="font-orbitron text-sm animate-pulse" style={{ color: 'var(--neon-cyan)' }}>LOADING...</div>
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-orbitron text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                    系統總覽
                </h1>
                <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>監控你的自動化銷售機器人狀態</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STAT_CARDS.map(card => (
                    <div key={card.label} className="glass-card rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `${card.color}12`, border: `1px solid ${card.color}30` }}>
                                <card.icon size={15} style={{ color: card.color }} />
                            </div>
                        </div>
                        <p className="font-orbitron text-2xl font-black mb-1" style={{ color: card.color }}>{card.value}</p>
                        <p className="font-rajdhani text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Unmatched Queries */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                    <Activity size={16} style={{ color: 'var(--neon-gold)' }} />
                    <h2 className="font-orbitron text-sm font-bold" style={{ color: 'var(--neon-gold)' }}>
                        未匹配訊息（建議新增規則）
                    </h2>
                </div>
                {unmatched.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>目前沒有未匹配的訊息 ✓</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {unmatched.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg"
                                style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)' }}>
                                <MessageSquare size={14} style={{ color: 'var(--neon-gold)', marginTop: 2, flexShrink: 0 }} />
                                <div className="min-w-0 flex-1">
                                    <p className="font-rajdhani text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.message}</p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                                    <Clock size={11} />
                                    <span className="font-mono text-xs">
                                        {new Date(item.received_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
