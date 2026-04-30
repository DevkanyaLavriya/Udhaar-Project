import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface TemplateEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  variables: string[];
}

export function TemplateEditor({ label, value, onChange, variables }: TemplateEditorProps) {
  const { session } = useStore();

  const handleInsert = (variable: string) => {
    // Basic append for simplicity. A full implementation could use cursor position.
    onChange(value + " {" + variable + "}");
  };

  // Live preview using mock data
  const renderPreview = () => {
    let preview = value;
    preview = preview.replace(/{Name}/g, "Rahul Sharma");
    preview = preview.replace(/{Amount}/g, "5000");
    preview = preview.replace(/{DueDate}/g, "Today");
    preview = preview.replace(/{ShopName}/g, session?.shopName || "Udhaar Shop");
    return preview;
  };

  const hasRequiredVars = value.includes("{Name}") || value.includes("{Amount}");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">{label}</label>
        {!hasRequiredVars && (
          <span className="text-xs text-destructive font-medium">Add {`{Name}`} or {`{Amount}`}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {variables.map(v => (
          <button
            key={v}
            type="button"
            onClick={() => handleInsert(v)}
            className="text-xs font-mono bg-saffron/10 text-saffron px-2 py-1 rounded hover:bg-saffron/20 transition-colors"
          >
            +{`{${v}}`}
          </button>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={`w-full p-3 bg-surface-raised rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth resize-none ${!hasRequiredVars && value.length > 0 ? 'border-destructive' : 'border-border'}`}
        placeholder="Type your message here..."
      />

      <div className="mt-3 bg-card border border-border/50 rounded-xl p-4 shadow-sm">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-2">Live Preview</p>
        <p className="text-sm whitespace-pre-wrap italic">"{renderPreview()}"</p>
      </div>
    </div>
  );
}
