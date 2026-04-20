import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { ShieldCheck, TrendingUp } from "lucide-react";

const riskColor = (level) => {
  if (level === 'Low') return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (level === 'Medium') return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
  return { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' };
};

export default function EligibilityCard({ T, score, risk, riskLabel }) {
  const c = riskColor(risk);
  return (
    <Card className="p-8 rounded-3xl border-border/60 shadow-elegant bg-card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-serif text-2xl">{T.eligibility}</h3>
        </div>
        <div className={`px-3 py-1.5 rounded-full ${c.bg} ${c.text} flex items-center gap-2 text-sm font-medium`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {T.risk}: {riskLabel}
        </div>
      </div>

      <div className="mb-3 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">{T.probability}</p>
        <div className="flex items-center gap-1 text-primary">
          <TrendingUp className="w-4 h-4" />
          <span className="font-serif text-4xl font-semibold">{score}%</span>
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 gradient-primary rounded-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6 text-center text-[11px] text-muted-foreground">
        <div>0</div><div>50</div><div>100</div>
      </div>
    </Card>
  );
}