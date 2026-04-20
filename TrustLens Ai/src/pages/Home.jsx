// @ts-nocheck
import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { t as getT, languageName } from '@/lib/i18n';
import { calculateEMI, defaultRate } from '@/lib/loanUtils';
import { applyLoanDecision, captureSessionArtifact, verifyLoanDocument } from '@/services/loanEngineClient';

import TopBar from '@/components/trustlens/TopBar';
import Hero from '@/components/trustlens/Hero';
import HowItWorks from '@/components/trustlens/HowItWorks';
import LoanForm from '@/components/trustlens/LoanForm';
import EligibilityCard from '@/components/trustlens/EligibilityCard';
import DocumentChecklist from '@/components/trustlens/DocumentChecklist';
import SummaryCard from '@/components/trustlens/SummaryCard';
import ChatPanel from '@/components/trustlens/ChatPanel';
import VideoCallModal from '@/components/trustlens/VideoCallModal';

/**
 * @typedef {{ eligibility_score: number, risk_level: 'Low' | 'Medium' | 'High', summary: string, emi: number, backend?: any, error?: string }} AnalysisResult
 */

export default function Home() {
  const [language, setLanguage] = useState('en');
  const T = useMemo(() => getT(language), [language]);

  const [data, setData] = useState({
    loan_type: 'personal',
    employment_type: 'salaried',
    monthly_income: 50000,
    loan_amount: 500000,
    loan_tenure: 36,
    existing_emi: 0,
    credit_score: 720,
    age: 35,
    business_vintage_years: 3,
    industry_risk: 'medium',
    bank_balance_avg: 100000,
    cashflow_volatility: 0.2,
  });

  const [loading, setLoading] = useState(false);
  /** @type {[AnalysisResult | null, import('react').Dispatch<import('react').SetStateAction<AnalysisResult | null>>]} */
  const [result, setResult] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  /** @type {import('react').MutableRefObject<HTMLElement | null>} */
  const formRef = useRef(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const analyze = async () => {
    setLoading(true);
    setResult(null);

    const emi = calculateEMI(Number(data.loan_amount), defaultRate(data.loan_type), Number(data.loan_tenure));
    const normalizedEmployment = data.employment_type === 'salaried' ? 'salaried' : 'self-employed';

    try {
      const response = await applyLoanDecision({
        user_id: 'web-user-001',
        age: Number(data.age) || 35,
        employment_type: normalizedEmployment,
        monthly_income: Number(data.monthly_income),
        loan_amount_requested: Number(data.loan_amount),
        loan_tenure_months: Number(data.loan_tenure),
        existing_emi: Number(data.existing_emi) || 0,
        credit_score: Number(data.credit_score),
        business_vintage_years: Number(data.business_vintage_years) || 3,
        industry_risk: data.industry_risk || 'medium',
        bank_balance_avg: Number(data.bank_balance_avg) || Number(data.monthly_income) * 2,
        cashflow_volatility: Number(data.cashflow_volatility) || 0.2,
        insurance_consent: true,
        insurance_selected: false,
        ekyc_consent: true,
        ekyc_otp: '123456',
      });

      const riskLevel = response.risk_score >= 0.66 ? 'High' : response.risk_score >= 0.33 ? 'Medium' : 'Low';
      const primaryOffer = response.offers?.[0] || { emi, approved_amount: Number(data.loan_amount) };
      const explanationText = (response.explanations || [])
        .map((/** @type {{feature: string, impact: number}} */ item) => `- ${item.feature}: ${Number(item.impact).toFixed(3)}`)
        .join('\n');

      const summary = [
        `## Decision`,
        `Status: ${response.decision.toUpperCase()}`,
        `FOIR: ${(response.foir * 100).toFixed(2)}%`,
        `Expected Loss: ₹${Number(response.expected_loss).toLocaleString('en-IN')}`,
        '',
        `## Offer Snapshot`,
        `Approved Amount: ₹${Number(primaryOffer.approved_amount).toLocaleString('en-IN')}`,
        `EMI: ₹${Number(primaryOffer.emi).toLocaleString('en-IN')}/month`,
        '',
        `## Top Risk Drivers`,
        explanationText || '- credit_score\n- monthly_income\n- loan_amount_requested',
      ].join('\n');

      const transformed = {
        eligibility_score: Math.max(1, Math.min(100, Math.round((1 - response.risk_score) * 100))),
        risk_level: riskLevel,
        summary,
        emi: Number(primaryOffer.emi) || emi,
        backend: response,
      };

      setResult(transformed);

      base44.entities.LoanAnalysis.create({
        ...data,
        monthly_income: Number(data.monthly_income),
        loan_amount: Number(data.loan_amount),
        loan_tenure: Number(data.loan_tenure),
        existing_emi: Number(data.existing_emi) || 0,
        credit_score: Number(data.credit_score),
        language,
        eligibility_score: transformed.eligibility_score,
        risk_level: transformed.risk_level,
        summary: transformed.summary,
        emi_estimate: transformed.emi,
      }).catch(() => {});
    } catch (error) {
      const prompt = `You are TrustLens AI, a friendly loan advisor.
Respond STRICTLY in ${languageName(language)} language for the "summary" field and any human-readable text.
Use the user's financial details to estimate approval probability (0-100) and risk level.

User data:
- Loan type: ${data.loan_type}
- Monthly income: ₹${data.monthly_income}
- Employment: ${data.employment_type}
- Credit score: ${data.credit_score}
- Loan amount: ₹${data.loan_amount}
- Tenure (months): ${data.loan_tenure}
- Existing EMI: ₹${data.existing_emi || 0}
- Estimated new EMI: ₹${emi}

Write a clear, warm summary in markdown with these sub-sections (use simple headings in ${languageName(language)}):
1) Simplified explanation of this loan
2) EMI overview
3) Interest impact
4) Repayment advice
5) Financial risk

Keep it practical, ~180-240 words total. Avoid jargon.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            eligibility_score: { type: 'number' },
            risk_level: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            summary: { type: 'string' },
          },
          required: ['eligibility_score', 'risk_level', 'summary'],
        },
      });

      const llmRes = (res && typeof res === 'object') ? res : {};
      setResult({
        eligibility_score: Number(llmRes.eligibility_score || 50),
        risk_level: llmRes.risk_level === 'High' || llmRes.risk_level === 'Medium' ? llmRes.risk_level : 'Low',
        summary: String(llmRes.summary || 'Unable to generate summary.'),
        emi,
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const riskLabelMap = { Low: T.low, Medium: T.medium, High: T.high };

  const verifyDocument = async (docType, file) => {
    return verifyLoanDocument(docType, file);
  };

  const storeSessionArtifact = async (artifactPayload) => {
    try {
      await captureSessionArtifact(artifactPayload);
    } catch {
      // Do not block the UX if session artifact storage fails.
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar T={T} language={language} setLanguage={setLanguage} onVideo={() => setVideoOpen(true)} />

      <Hero T={T} onStart={scrollToForm} />

      <HowItWorks T={T} />

      <section ref={formRef} className="max-w-6xl mx-auto px-6 pb-16">
        <LoanForm T={T} data={data} setData={setData} onAnalyze={analyze} loading={loading} />
      </section>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto px-6 pb-16"
          >
            <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-elegant">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
              <p className="text-muted-foreground">{T.analyzing}</p>
            </div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto px-6 pb-24 space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <EligibilityCard
                T={T}
                score={Math.round(result.eligibility_score)}
                risk={result.risk_level}
                riskLabel={riskLabelMap[result.risk_level] || result.risk_level}
              />
              <DocumentChecklist T={T} onVerify={verifyDocument} />
            </div>
            <SummaryCard T={T} summary={result.summary} emi={result.emi} language={language} />
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TrustLens AI · {T.tagline}
      </footer>

      <ChatPanel T={T} language={language} context={{ ...data, ...(result || {}) }} />
      <VideoCallModal
        T={T}
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        onSessionArtifact={storeSessionArtifact}
        userId="web-user-001"
      />
    </div>
  );
}