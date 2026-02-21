'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (mode === 'signup') {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { display_name: displayName } },
            });
            if (signUpError) { setError(signUpError.message); }
            else { setSuccess('帳號已建立！正在跳轉到設定精靈...'); setTimeout(() => router.push('/onboarding'), 1200); }
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) { setError('Email 或密碼錯誤'); }
            else { router.push('/dashboard/overview'); router.refresh(); }
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'var(--bg-primary)' }}>

            {/* Background grid */}
            <div className="fixed inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(var(--neon-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }} />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid var(--neon-cyan)' }}>
                            <Zap size={20} style={{ color: 'var(--neon-cyan)' }} />
                        </div>
                        <span className="font-orbitron text-xl font-bold" style={{ color: 'var(--neon-cyan)' }}>
                            SOCIAL<span style={{ color: 'var(--neon-pink)' }}>MANAGER</span>
                        </span>
                    </div>
                    <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>
                        你的 AI 自動銷售機器人平台
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card p-8 rounded-xl">
                    {/* Tab Switch */}
                    <div className="flex mb-6 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-cyan)' }}>
                        {(['login', 'signup'] as const).map((m) => (
                            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                                className="flex-1 py-2.5 font-orbitron text-xs font-bold tracking-widest transition-all"
                                style={{
                                    background: mode === m ? 'rgba(0,245,255,0.12)' : 'transparent',
                                    color: mode === m ? 'var(--neon-cyan)' : 'var(--text-muted)',
                                }}>
                                {m === 'login' ? '登入' : '註冊'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Display Name (signup only) */}
                        {mode === 'signup' && (
                            <div className="relative">
                                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input type="text" placeholder="您的名稱" value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                                    required />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input type="email" placeholder="Email" value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                                required />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input type={showPass ? 'text' : 'password'} placeholder="密碼（至少 6 位）" value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="cyber-input w-full pl-10 pr-10 py-3 rounded-lg text-sm"
                                required minLength={6} />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>

                        {/* Error / Success */}
                        {error && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-rajdhani"
                                style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid var(--neon-pink)', color: 'var(--neon-pink)' }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-rajdhani"
                                style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                                ✓ {success}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="btn-solid-cyan w-full py-3 rounded-lg font-orbitron text-sm font-bold tracking-widest mt-2 disabled:opacity-50">
                            {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
                        </button>
                    </form>

                    {mode === 'login' && (
                        <p className="text-center mt-4 text-xs font-rajdhani" style={{ color: 'var(--text-muted)' }}>
                            還沒有帳號？{' '}
                            <button onClick={() => setMode('signup')} style={{ color: 'var(--neon-cyan)' }} className="hover:underline">
                                立即註冊
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
