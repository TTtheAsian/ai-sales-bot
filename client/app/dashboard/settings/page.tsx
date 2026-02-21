'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setEmail(user.email || '');
                setDisplayName(user.user_metadata?.display_name || '');
            }
        });
    }, []);

    async function updateProfile(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        const updates: { data?: { display_name: string } } = { data: { display_name: displayName } };
        const { error } = await supabase.auth.updateUser(updates);
        if (error) setMsg({ text: error.message, type: 'err' });
        else setMsg({ text: '個人資料已更新！', type: 'ok' });
        setLoading(false);
        setTimeout(() => setMsg(null), 3000);
    }

    async function updatePassword(e: React.FormEvent) {
        e.preventDefault();
        if (newPassword.length < 6) { setMsg({ text: '密碼至少需要 6 個字元', type: 'err' }); return; }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) setMsg({ text: error.message, type: 'err' });
        else { setMsg({ text: '密碼已更新！', type: 'ok' }); setNewPassword(''); }
        setLoading(false);
        setTimeout(() => setMsg(null), 3000);
    }

    const MsgBox = () => msg ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-rajdhani"
            style={{
                background: msg.type === 'ok' ? 'rgba(0,245,255,0.08)' : 'rgba(255,0,110,0.08)',
                border: `1px solid ${msg.type === 'ok' ? 'var(--neon-cyan)' : 'var(--neon-pink)'}`,
                color: msg.type === 'ok' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
            }}>
            {msg.type === 'ok' ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {msg.text}
        </div>
    ) : null;

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-orbitron text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>帳戶設定</h1>
                <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>管理你的個人資料和存取憑證</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <User size={15} style={{ color: 'var(--neon-cyan)' }} />
                        <h2 className="font-orbitron text-xs font-bold tracking-widest" style={{ color: 'var(--neon-cyan)' }}>個人資料</h2>
                    </div>
                    <form onSubmit={updateProfile} className="space-y-4">
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>顯示名稱</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                                    placeholder="你的名稱" className="cyber-input w-full pl-9 pr-4 py-2.5 rounded-lg text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input value={email} readOnly
                                    className="cyber-input w-full pl-9 pr-4 py-2.5 rounded-lg text-sm opacity-60 cursor-not-allowed" />
                            </div>
                        </div>
                        <MsgBox />
                        <button type="submit" disabled={loading}
                            className="btn-solid-cyan px-6 py-2.5 rounded-lg font-orbitron text-xs font-bold tracking-widest disabled:opacity-40">
                            {loading ? '儲存中...' : '更新資料'}
                        </button>
                    </form>
                </div>

                {/* Password */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Lock size={15} style={{ color: 'var(--neon-pink)' }} />
                        <h2 className="font-orbitron text-xs font-bold tracking-widest" style={{ color: 'var(--neon-pink)' }}>修改密碼</h2>
                    </div>
                    <form onSubmit={updatePassword} className="space-y-4">
                        <div>
                            <label className="block font-rajdhani text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>新密碼</label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    placeholder="至少 6 個字元" minLength={6}
                                    className="cyber-input w-full pl-9 pr-4 py-2.5 rounded-lg text-sm" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="px-6 py-2.5 rounded-lg font-orbitron text-xs font-bold tracking-widest disabled:opacity-40 transition-all"
                            style={{ border: '1px solid var(--neon-pink)', color: 'var(--neon-pink)' }}>
                            {loading ? '更新中...' : '更新密碼'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
