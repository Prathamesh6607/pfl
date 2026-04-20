// @ts-nocheck
import React, { useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { FileCheck2, Check, Upload, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

const verdictMeta = {
  verified: {
    label: 'Verified',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
  review_required: {
    label: 'Needs review',
    icon: AlertTriangle,
    color: 'text-amber-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600',
    border: 'border-red-200',
    bg: 'bg-red-50',
  },
};

export default function DocumentChecklist({ T, onVerify }) {
  const items = [
    { key: 'pan', label: T.docs.pan },
    { key: 'aadhaar', label: T.docs.aadhaar },
    { key: 'salary', label: T.docs.salary },
    { key: 'bank', label: T.docs.bank },
    { key: 'address', label: T.docs.address },
    { key: 'photo', label: T.docs.photo },
  ];

  const [selectedFiles, setSelectedFiles] = useState({});
  const [verifications, setVerifications] = useState({});
  const [verifying, setVerifying] = useState({});
  const fileInputRefs = useRef({});

  const pickFile = (docKey) => {
    fileInputRefs.current[docKey]?.click();
  };

  const onFileChange = (docKey, file) => {
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [docKey]: file }));
    setVerifications((prev) => ({ ...prev, [docKey]: null }));
  };

  const verifyDocument = async (docKey) => {
    const file = selectedFiles[docKey];
    if (!file || !onVerify) return;

    setVerifying((prev) => ({ ...prev, [docKey]: true }));
    try {
      const result = await onVerify(docKey, file);
      setVerifications((prev) => ({ ...prev, [docKey]: result }));
    } catch (error) {
      setVerifications((prev) => ({
        ...prev,
        [docKey]: {
          ai_verdict: 'rejected',
          confidence: 0,
          issues: [String(error.message || 'verification_failed')],
        },
      }));
    } finally {
      setVerifying((prev) => ({ ...prev, [docKey]: false }));
    }
  };

  return (
    <Card className="p-8 rounded-3xl border-border/60 shadow-elegant bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
          <FileCheck2 className="w-5 h-5 text-accent-foreground" />
        </div>
        <h3 className="font-serif text-2xl">{T.documents}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((it) => {
          const file = selectedFiles[it.key];
          const verification = verifications[it.key];
          const verdict = verification?.ai_verdict;
          const meta = verdict ? verdictMeta[verdict] : null;
          const VerdictIcon = meta?.icon;

          return (
            <li key={it.key}>
              <div className="w-full rounded-2xl px-4 py-3 border border-border hover:border-primary/40 hover:bg-accent/40 transition-all text-left">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center border ${verification ? 'gradient-primary border-transparent' : 'border-border'}`}>
                      {verification && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{it.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file ? file.name : 'No file selected'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[it.key] = el;
                      }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => onFileChange(it.key, e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => pickFile(it.key)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary/40"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </button>
                    <button
                      type="button"
                      disabled={!file || !!verifying[it.key]}
                      onClick={() => verifyDocument(it.key)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs hover:bg-primary/5 disabled:opacity-50"
                    >
                      {verifying[it.key] ? 'Verifying...' : 'AI Verify'}
                    </button>
                  </div>
                </div>

                {meta && (
                  <div className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${meta.bg} ${meta.border} ${meta.color}`}>
                    {VerdictIcon && <VerdictIcon className="w-3.5 h-3.5" />}
                    <span>{meta.label}</span>
                    <span>· {Math.round((Number(verification?.confidence) || 0) * 100)}%</span>
                  </div>
                )}

                {!!verification?.issues?.length && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {verification.issues.join(', ')}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}