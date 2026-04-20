import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { languageName } from "@/lib/i18n";
import ReactMarkdown from 'react-markdown';

export default function ChatPanel({ T, language, context }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: T.welcome_chat }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages((m) => [{ ...m[0], text: T.welcome_chat }, ...m.slice(1)]);
    // eslint-disable-next-line
  }, [language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    const prompt = `You are TrustLens AI, a friendly loan advisor. Reply strictly in ${languageName(language)} language.
Keep answers short (2-4 sentences), warm, and simple enough for non-experts.

User loan context (if available): ${JSON.stringify(context || {})}

Conversation so far:
${history.map(m => `${m.role === 'user' ? 'User' : 'Advisor'}: ${m.text}`).join('\n')}

Advisor reply:`;

    const reply = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages((m) => [...m, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-primary text-white shadow-luxe flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-card z-50 shadow-luxe flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-serif text-lg leading-tight">{T.chat_title}</p>
                    <p className="text-xs text-muted-foreground">TrustLens AI</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'gradient-primary text-white rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm'
                    }`}>
                      {m.role === 'ai'
                        ? <div className="prose prose-sm max-w-none prose-p:my-1"><ReactMarkdown>{m.text}</ReactMarkdown></div>
                        : m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl px-4 py-2.5 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">…</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder={T.chat_placeholder}
                  className="rounded-full h-11"
                />
                <Button onClick={send} disabled={loading} className="gradient-primary text-white rounded-full h-11 px-5">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}