import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-md pl-3 pr-1 py-1 shadow-sm">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-0 shadow-none h-8 w-auto bg-transparent focus:ring-0 gap-2 px-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {Object.values(LANGUAGES).map((l) => (
            <SelectItem key={l.code} value={l.code}>
              <span className="font-medium">{l.native}</span>
              <span className="text-muted-foreground ml-2 text-xs">{l.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}