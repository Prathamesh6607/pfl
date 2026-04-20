import React from 'react';
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

export default function TopBar({ T, language, setLanguage, onVideo }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-serif text-sm font-semibold">T</span>
          </div>
          <div className="leading-tight">
            <p className="font-serif text-base font-semibold">{T.brand}</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">{T.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector value={language} onChange={setLanguage} />
          <Button onClick={onVideo} variant="outline" className="rounded-full h-10 hidden sm:inline-flex">
            <Video className="w-4 h-4 mr-2" /> {T.talk_ai}
          </Button>
        </div>
      </div>
    </header>
  );
}