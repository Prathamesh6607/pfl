import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BrainCircuit, Headphones } from 'lucide-react';

export default function HowItWorks({ T }) {
  const steps = [
    { icon: FileText, title: T.step1, sub: T.step1_sub },
    { icon: BrainCircuit, title: T.step2, sub: T.step2_sub },
    { icon: Headphones, title: T.step3, sub: T.step3_sub },
  ];
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{T.how_it_works}</p>
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group p-6 rounded-3xl border border-border bg-card hover:border-primary/30 transition-all shadow-elegant"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center group-hover:gradient-primary transition-all">
                <s.icon className="w-5 h-5 text-accent-foreground group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">0{i + 1}</p>
                <h4 className="font-serif text-xl leading-tight">{s.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{s.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}