import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Hero({ T, onStart }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-70" />
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-card/70 backdrop-blur-md border border-border px-3 py-1.5 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium tracking-wide text-foreground/80">
              Agentic AI · RAG · Multilingual
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] text-foreground mb-6">
            {T.hero_title.split(' ').map((w, i, arr) =>
              i === arr.length - 1
                ? <span key={i} className="gradient-text italic">{w}</span>
                : <span key={i}>{w} </span>
            )}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            {T.hero_sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={onStart}
              className="gradient-primary text-white hover:opacity-95 h-12 px-6 rounded-full shadow-luxe"
            >
              {T.start}
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}