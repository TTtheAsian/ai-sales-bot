'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Tag, MessageCircle, Clock, Smartphone } from 'lucide-react';

interface Contact {
    id: string;
    fb_user_id: string;
    name: string;
    profile_pic: string;
    tags: string[];
    last_interaction: string;
}

export default function AudiencePage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadContacts = useCallback(async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('last_interaction', { ascending: false });

        if (data) setContacts(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    const filteredContacts = contacts.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        c.fb_user_id.includes(search) ||
        c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center neon-text-cyan animate-pulse font-orbitron">LOADING AUDIENCE...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-orbitron text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>受眾管理 (CRM)</h1>
                    <p className="font-rajdhani text-sm" style={{ color: 'var(--text-muted)' }}>管理互動過的客戶與標籤</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="搜尋名稱、ID 或標籤..."
                        className="cyber-input pl-10 pr-4 py-2 rounded-lg text-sm w-full md:w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden border-cyan/20">
                <div className="grid grid-cols-1 divide-y divide-white/5">
                    {filteredContacts.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-3">
                            <Users size={48} className="text-muted-foreground opacity-20" />
                            <p className="font-rajdhani text-muted-foreground">尚未有受眾資料或搜尋無結果</p>
                        </div>
                    ) : (
                        filteredContacts.map(contact => (
                            <div key={contact.id} className="p-4 hover:bg-white/5 transition-all flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-cyan/30">
                                    {contact.profile_pic ? (
                                        <img src={contact.profile_pic} alt={contact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Users size={20} className="text-cyan" style={{ color: 'var(--neon-cyan)' }} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-rajdhani font-bold text-white truncate">
                                            {contact.name || `客戶 ${contact.fb_user_id.slice(-6)}`}
                                        </h3>
                                        <span className="font-mono text-[10px] text-muted-foreground bg-black/40 px-2 py-0.5 rounded border border-white/10 uppercase">
                                            ID: {contact.fb_user_id}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {contact.tags.length > 0 ? (
                                            contact.tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 text-[10px] font-rajdhani text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                                                    <Tag size={8} /> {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] font-rajdhani text-muted-foreground italic">尚無標籤</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 text-right">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Clock size={10} />
                                        {new Date(contact.last_interaction).toLocaleString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg border border-cyan/30 hover:bg-cyan/10 transition-colors" title="開啟對話">
                                            <MessageCircle size={14} className="text-cyan" style={{ color: 'var(--neon-cyan)' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl border-cyan/20">
                    <p className="font-rajdhani text-xs text-muted-foreground mb-1">總受眾數量</p>
                    <p className="font-orbitron text-2xl font-black text-cyan" style={{ color: 'var(--neon-cyan)' }}>{contacts.length}</p>
                </div>
                <div className="glass-card p-4 rounded-xl border-purple/20">
                    <p className="font-rajdhani text-xs text-muted-foreground mb-1">活躍標籤</p>
                    <p className="font-orbitron text-2xl font-black text-purple-400">
                        {new Set(contacts.flatMap(c => c.tags)).size}
                    </p>
                </div>
                <div className="glass-card p-4 rounded-xl border-gold/20">
                    <p className="font-rajdhani text-xs text-muted-foreground mb-1">24小時內互動</p>
                    <p className="font-orbitron text-2xl font-black text-yellow-400">
                        {contacts.filter(c => new Date(c.last_interaction).getTime() > Date.now() - 86400000).length}
                    </p>
                </div>
            </div>
        </div>
    );
}
