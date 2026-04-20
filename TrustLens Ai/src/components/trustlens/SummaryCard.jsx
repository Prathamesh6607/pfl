import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Wallet } from "lucide-react";
import { formatINR } from "@/lib/loanUtils";
import { LANGUAGES } from "@/lib/i18n";

export default function SummaryCard({ T, summary, emi, language }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = () => {
    if (!summary || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(summary.replace(/[#*_`>-]/g, ' '));
    u.lang = LANGUAGES[language]?.speech || 'en-IN';
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <Card className="p-8 rounded-3xl border-border/60 shadow-elegant bg-card">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h3 className="font-serif text-2xl">{T.summary_title}</h3>
        {speaking ? (
          <Button onClick={stop} variant="outline" className="rounded-full">
            <Square className="w-4 h-4 mr-2" /> {T.stop}
          </Button>
        ) : (
          <Button onClick={speak} className="gradient-primary text-white rounded-full hover:opacity-95">
            <Mic className="w-4 h-4 mr-2" /> {T.listen}
          </Button>
        )}
      </div>

      <div className="rounded-2xl bg-accent/40 border border-border p-5 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{T.emi_overview}</p>
          <p className="font-serif text-2xl">{formatINR(emi)}<span className="text-sm text-muted-foreground font-sans ml-1">/mo</span></p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none prose-headings:font-serif prose-p:text-foreground/80 prose-strong:text-foreground prose-li:text-foreground/80">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </Card>
  );
}