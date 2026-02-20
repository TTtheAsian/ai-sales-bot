'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bot, Zap, Shield, MessageSquare, ChevronRight, Radio } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: '關鍵字自動回覆',
    desc: '設定關鍵字規則，訊息秒回，24/7 不間斷服務',
    color: 'cyan',
  },
  {
    icon: Shield,
    title: '多帳號管理',
    desc: '集中管理所有 Facebook & Instagram 帳號',
    color: 'pink',
  },
  {
    icon: Zap,
    title: 'Webhook 即時觸發',
    desc: '收到訊息毫秒內觸發規則，極速響應',
    color: 'gold',
  },
];

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [glitchText, setGlitchText] = useState('AI SALES BOT');

  useEffect(() => {
    setMounted(true);
    // Glitch effect
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    const target = 'AI SALES BOT';
    let iteration = 0;
    const interval = setInterval(() => {
      setGlitchText(
        target.split('').map((char, index) => {
          if (index < iteration) return char;
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      if (iteration >= target.length) clearInterval(interval);
      iteration += 0.5;
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen cyber-grid relative overflow-hidden flex flex-col">
      {/* Background glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--neon-cyan), transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--neon-pink), transparent)' }} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b"
        style={{ borderColor: 'var(--border-cyan)', background: 'rgba(4, 8, 16, 0.8)' }}>
        <div className="flex items-center gap-3">
          <Radio size={18} style={{ color: 'var(--neon-cyan)' }} className="animate-pulse" />
          <span className="font-orbitron text-xs tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            SOCIAL<span style={{ color: 'var(--neon-cyan)' }}>MANAGER</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 6px #4ade80' }} />
          <span className="font-mono-jp text-xs" style={{ color: 'var(--text-muted)' }}>SYS_ACTIVE</span>
        </div>
      </div>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border"
            style={{ borderColor: 'var(--border-cyan)', background: 'rgba(0, 245, 255, 0.05)' }}>
            <Bot size={14} style={{ color: 'var(--neon-cyan)' }} />
            <span className="font-orbitron text-xs tracking-widest" style={{ color: 'var(--neon-cyan)' }}>
              AUTOMATED INTELLIGENCE
            </span>
          </div>

          {/* Title */}
          <h1 className="font-orbitron font-black mb-4 leading-none"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
            <span className="gradient-text-cyber">{glitchText}</span>
          </h1>

          <p className="font-rajdhani text-xl mb-10 max-w-xl mx-auto tracking-wide"
            style={{ color: 'var(--text-secondary)' }}>
            為你的 Facebook / Instagram 打造全自動銷售機器人。<br />
            設定規則，讓 AI 幫你 24/7 回覆客戶訊息。
          </p>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-solid-cyan inline-flex items-center gap-3 px-10 py-4 rounded-lg text-lg font-orbitron cursor-pointer"
          >
            <span>進入控制台</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Features */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-20 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((f, i) => {
            const Icon = f.icon;
            const colorMap = {
              cyan: { border: 'var(--border-cyan)', text: 'var(--neon-cyan)', glow: 'rgba(0,245,255,0.1)' },
              pink: { border: 'var(--border-pink)', text: 'var(--neon-pink)', glow: 'rgba(255,0,110,0.1)' },
              gold: { border: 'rgba(255,215,0,0.25)', text: 'var(--neon-gold)', glow: 'rgba(255,215,0,0.1)' },
            };
            const c = colorMap[f.color as keyof typeof colorMap];
            return (
              <div
                key={i}
                className="p-6 rounded-xl text-left transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${c.border}`,
                  boxShadow: `0 0 20px ${c.glow}`,
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: c.glow, border: `1px solid ${c.border}` }}>
                  <Icon size={20} style={{ color: c.text }} />
                </div>
                <h3 className="font-orbitron text-sm font-bold mb-2" style={{ color: c.text }}>
                  {f.title}
                </h3>
                <p className="font-rajdhani text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom stat bar */}
        <div className="flex items-center gap-8 mt-16 flex-wrap justify-center">
          {[
            { label: 'RESPONSE TIME', value: '< 1s' },
            { label: 'UPTIME', value: '99.9%' },
            { label: 'PLATFORMS', value: 'FB + IG' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-orbitron text-2xl font-black neon-text-cyan">{stat.value}</div>
              <div className="font-mono-jp text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <div className="flex items-center justify-center py-4 border-t"
        style={{ borderColor: 'var(--border-cyan)' }}>
        <span className="font-mono-jp text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2026 SocialManager — AI-Powered Sales Automation
        </span>
      </div>
    </div>
  );
}
