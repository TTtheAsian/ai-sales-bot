'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Send, User, Bot, Search, Hash } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    created_at: string;
    contact_id: string;
}

interface Contact {
    id: string;
    fb_user_id: string;
    name: string;
    profile_pic: string;
    last_interaction: string;
}

export default function LiveChatPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` };
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadContacts = useCallback(async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('last_interaction', { ascending: false });

        if (data && data.length > 0) {
            setContacts(data);
        }
        setLoadingContacts(false);
    }, []);

    const loadMessages = useCallback(async (contactId: string) => {
        setLoadingMessages(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('contact_id', contactId)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
        setLoadingMessages(false);
    }, []);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    useEffect(() => {
        if (selectedContact) {
            loadMessages(selectedContact.id);

            // Subscribe to new messages
            const channel = supabase
                .channel(`messages:${selectedContact.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `contact_id=eq.${selectedContact.id}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new as Message]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedContact, loadMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact || sending) return;

        setSending(true);
        try {
            const h = await getHeaders();
            const res = await fetch(`${API_URL}/api/messages/send`, {
                method: 'POST',
                headers: h,
                body: JSON.stringify({
                    contactId: selectedContact.id,
                    text: newMessage
                })
            });

            if (res.ok) {
                setNewMessage('');
            } else {
                const err = await res.json();
                alert('傳送失敗: ' + err.error);
            }
        } catch (err) {
            console.error('Send error:', err);
            alert('傳送出錯，請稍後再試');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex gap-4">
            {/* Sidebar: Contacts List */}
            <div className="w-64 md:w-80 flex flex-col glass-card rounded-xl overflow-hidden border-cyan/20">
                <div className="p-4 border-b border-white/10 flex items-center gap-2">
                    <MessageCircle size={18} className="text-cyan" style={{ color: 'var(--neon-cyan)' }} />
                    <h2 className="font-orbitron text-xs font-bold uppercase tracking-widest text-cyan" style={{ color: 'var(--neon-cyan)' }}>對話列表</h2>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                    {loadingContacts ? (
                        <div className="p-8 text-center animate-pulse text-xs font-mono">LOADING...</div>
                    ) : contacts.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">查無對話</div>
                    ) : (
                        contacts.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`w-full p-4 flex items-center gap-3 transition-all hover:bg-white/5 text-left ${selectedContact?.id === contact.id ? 'bg-cyan/10 border-l-2 border-cyan' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-white/10 overflow-hidden flex-shrink-0">
                                    {contact.profile_pic ? (
                                        <img src={contact.profile_pic} alt={contact.name} className="w-full h-full object-cover" />
                                    ) : <User size={16} className="text-muted-foreground" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-rajdhani font-bold text-white truncate text-sm">
                                        {contact.name || `客戶 ${contact.fb_user_id.slice(-6)}`}
                                    </p>
                                    <p className="font-mono text-[9px] text-muted-foreground truncate">
                                        ID: {contact.fb_user_id}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content: Chat View */}
            <div className="flex-1 flex flex-col glass-card rounded-xl overflow-hidden border-cyan/20">
                {selectedContact ? (
                    <>
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center border border-cyan/30">
                                    <User size={14} className="text-cyan" style={{ color: 'var(--neon-cyan)' }} />
                                </div>
                                <h3 className="font-rajdhani font-bold text-white">
                                    {selectedContact.name || selectedContact.fb_user_id}
                                </h3>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingMessages ? (
                                <div className="h-full flex items-center justify-center font-orbitron text-xs animate-pulse">載入訊息中...</div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center flex-col gap-2 text-muted-foreground italic text-sm">
                                    <Hash size={24} className="opacity-20" />
                                    尚未有訊息歷史
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[80%] flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${msg.sender === 'user' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
                                                {msg.sender === 'user' ? <User size={10} className="text-purple-400" /> : <Bot size={10} className="text-cyan" style={{ color: 'var(--neon-cyan)' }} />}
                                            </div>
                                            <div className={`p-3 rounded-2xl text-sm font-rajdhani ${msg.sender === 'user' ? 'bg-white/5 text-white rounded-tl-none' : 'bg-cyan/10 text-cyan border border-cyan/20 rounded-tr-none'}`}>
                                                {msg.text}
                                                <div className="mt-1 text-[8px] opacity-40 font-mono text-right">
                                                    {new Date(msg.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
                            <input
                                type="text"
                                placeholder="輸入回覆訊息..."
                                className="cyber-input flex-1 px-4 py-2 rounded-lg text-sm"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="p-2.5 rounded-lg btn-solid-cyan">
                                <Send size={16} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground opacity-40">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                            <MessageCircle size={32} />
                        </div>
                        <p className="font-orbitron text-xs tracking-widest">請從左側選擇一個對話</p>
                    </div>
                )}
            </div>
        </div>
    );
}
