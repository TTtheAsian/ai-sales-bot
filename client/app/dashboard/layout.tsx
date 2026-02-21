'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard, MessageSquare, Smartphone, Link2,
    Settings, Zap, LogOut, Menu, X, ChevronRight, User,
    Users, MessageCircle
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/dashboard/overview', label: '總覽', icon: LayoutDashboard, color: 'var(--neon-cyan)' },
    { href: '/dashboard/audience', label: '受眾管理', icon: Users, color: 'var(--neon-purple)' },
    { href: '/dashboard/live-chat', label: '即時對話', icon: MessageCircle, color: 'var(--neon-green)' },
    { href: '/dashboard/rules', label: '自動回覆規則', icon: MessageSquare, color: 'var(--neon-pink)' },
    { href: '/dashboard/accounts', label: '帳號管理', icon: Smartphone, color: 'var(--neon-cyan)' },
    { href: '/dashboard/webhook', label: 'Webhook 設定', icon: Link2, color: 'var(--neon-gold)' },
    { href: '/dashboard/settings', label: '帳戶設定', icon: Settings, color: 'var(--text-muted)' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ email?: string; display_name?: string } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { router.push('/auth'); return; }
            setUser({ email: user.email, display_name: user.user_metadata?.display_name });
        });
    }, [router]);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/auth');
    }

    const Sidebar = ({ mobile = false }) => (
        <aside className={`flex flex-col h-full`}
            style={{
                width: mobile ? '100%' : '240px',
                background: 'var(--bg-secondary)',
                borderRight: mobile ? 'none' : '1px solid var(--border-cyan)',
                flexShrink: 0,
            }}>
            {/* Logo */}
            <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid var(--neon-cyan)' }}>
                    <Zap size={15} style={{ color: 'var(--neon-cyan)' }} />
                </div>
                <span className="font-orbitron text-sm font-bold" style={{ color: 'var(--neon-cyan)' }}>
                    SOCIAL<span style={{ color: 'var(--neon-pink)' }}>MGR</span>
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1">
                {NAV_ITEMS.map(item => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
                            style={{
                                background: active ? `${item.color}12` : 'transparent',
                                border: `1px solid ${active ? item.color + '40' : 'transparent'}`,
                                color: active ? item.color : 'var(--text-muted)',
                            }}>
                            <item.icon size={16} />
                            <span className="font-rajdhani text-sm font-medium flex-1">{item.label}</span>
                            {active && <ChevronRight size={12} />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="p-4" style={{ borderTop: '1px solid var(--border-muted)' }}>
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid var(--border-cyan)' }}>
                        <User size={13} style={{ color: 'var(--neon-cyan)' }} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-rajdhani text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {user?.display_name || user?.email?.split('@')[0] || '用戶'}
                        </p>
                        <p className="font-mono text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                            {user?.email}
                        </p>
                    </div>
                </div>
                <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-rajdhani text-xs transition-all"
                    style={{ color: 'var(--neon-pink)', border: '1px solid rgba(255,0,110,0.2)' }}>
                    <LogOut size={13} /> 登出
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-64 z-10">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Top Bar */}
                <div className="md:hidden flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-secondary)' }}>
                    <span className="font-orbitron text-sm font-bold" style={{ color: 'var(--neon-cyan)' }}>
                        SOCIAL<span style={{ color: 'var(--neon-pink)' }}>MGR</span>
                    </span>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: 'var(--text-primary)' }}>
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
