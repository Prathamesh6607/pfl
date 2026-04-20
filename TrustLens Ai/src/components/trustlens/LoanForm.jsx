import React from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Loader2 } from "lucide-react";

const Field = ({ label, help, children }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {children}
    {help && <p className="text-xs text-muted-foreground leading-relaxed">{help}</p>}
  </div>
);

export default function LoanForm({ T, data, setData, onAnalyze, loading }) {
  const update = (k, v) => setData({ ...data, [k]: v });

  return (
    <Card className="p-6 md:p-10 rounded-3xl border-border/60 shadow-luxe bg-card">
      <div className="mb-8">
        <h2 className="font-serif text-3xl md:text-4xl mb-2">{T.loan_details}</h2>
        <p className="text-muted-foreground">{T.loan_details_sub}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label={T.loan_type} help={T.loan_type_help}>
          <Select value={data.loan_type} onValueChange={(v) => update('loan_type', v)}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">{T.personal}</SelectItem>
              <SelectItem value="home">{T.home}</SelectItem>
              <SelectItem value="education">{T.education}</SelectItem>
              <SelectItem value="business">{T.business}</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label={T.employment_type} help={T.employment_help}>
          <Select value={data.employment_type} onValueChange={(v) => update('employment_type', v)}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="salaried">{T.salaried}</SelectItem>
              <SelectItem value="self_employed">{T.self_employed}</SelectItem>
              <SelectItem value="business_owner">{T.business_owner}</SelectItem>
              <SelectItem value="student">{T.student}</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label={T.monthly_income} help={T.monthly_income_help}>
          <Input type="number" value={data.monthly_income}
            onChange={(e) => update('monthly_income', e.target.value)}
            className="h-11 rounded-xl" placeholder="50000" />
        </Field>

        <Field label={T.loan_amount} help={T.loan_amount_help}>
          <Input type="number" value={data.loan_amount}
            onChange={(e) => update('loan_amount', e.target.value)}
            className="h-11 rounded-xl" placeholder="500000" />
        </Field>

        <Field label={T.loan_tenure} help={T.tenure_help}>
          <Input type="number" value={data.loan_tenure}
            onChange={(e) => update('loan_tenure', e.target.value)}
            className="h-11 rounded-xl" placeholder="36" />
        </Field>

        <Field label={T.existing_emi} help={T.existing_emi_help}>
          <Input type="number" value={data.existing_emi}
            onChange={(e) => update('existing_emi', e.target.value)}
            className="h-11 rounded-xl" placeholder="0" />
        </Field>

        <div className="md:col-span-2">
          <Field label={`${T.credit_score} — ${data.credit_score}`} help={T.credit_score_help}>
            <div className="px-1 pt-2">
              <Slider
                min={300} max={900} step={10}
                value={[Number(data.credit_score) || 700]}
                onValueChange={([v]) => update('credit_score', v)}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                <span>300</span><span>600</span><span>750</span><span>900</span>
              </div>
            </div>
          </Field>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          size="lg"
          onClick={onAnalyze}
          disabled={loading}
          className="gradient-primary text-white h-12 px-8 rounded-full shadow-elegant hover:opacity-95"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {T.analyzing}</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> {T.analyze}</>
          )}
        </Button>
      </div>
    </Card>
  );
}