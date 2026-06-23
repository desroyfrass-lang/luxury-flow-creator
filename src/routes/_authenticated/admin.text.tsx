import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteTexts } from "@/hooks/use-site-text";
import { TEXT_SECTIONS, type TextSlot } from "@/lib/text-slots";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/text")({
  component: AdminTextPage,
});

function AdminTextPage() {
  const { data: overrides, isLoading } = useSiteTexts();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading copy…</div>;
  }

  return (
    <div className="space-y-12">
      <div className="rounded-xl border border-border/60 bg-card/60 p-5">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Text editor
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit any visible text on the site. Changes save instantly and are picked up by every page within a minute (or after a hard refresh).
          Use <span className="font-mono text-foreground">Reset</span> to revert a slot back to the bundled default copy.
        </p>
      </div>

      {TEXT_SECTIONS.map((section) => (
        <section key={section.title}>
          <div className="mb-5">
            <h2 className="font-display text-2xl">{section.title}</h2>
            {section.description && (
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {section.slots.map((slot) => (
              <TextSlotEditor
                key={slot.key}
                slot={slot}
                currentValue={overrides?.get(slot.key)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TextSlotEditor({
  slot,
  currentValue,
}: {
  slot: TextSlot;
  currentValue: string | undefined;
}) {
  const qc = useQueryClient();
  const [value, setValue] = useState(currentValue ?? slot.defaultValue);
  const [busy, setBusy] = useState(false);
  const isOverride = currentValue !== undefined;
  const dirty = value !== (currentValue ?? slot.defaultValue);

  useEffect(() => {
    setValue(currentValue ?? slot.defaultValue);
  }, [currentValue, slot.defaultValue]);

  const onSave = async () => {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("site_text")
        .upsert({ slot_key: slot.key, value }, { onConflict: "slot_key" });
      if (error) throw error;
      toast.success(`${slot.label} saved`);
      qc.invalidateQueries({ queryKey: ["site-text"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (!isOverride) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("site_text")
        .delete()
        .eq("slot_key", slot.key);
      if (error) throw error;
      toast.success(`${slot.label} reset to default`);
      qc.invalidateQueries({ queryKey: ["site-text"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{slot.label}</div>
          {slot.hint && (
            <div className="mt-1 text-[11px] text-muted-foreground">{slot.hint}</div>
          )}
        </div>
        {isOverride && (
          <span className="shrink-0 rounded-full bg-[color:var(--gold)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[color:var(--ink)]">
            Custom
          </span>
        )}
      </div>
      {slot.multiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          className="mt-3 w-full resize-y rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-3 w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
        />
      )}
      <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        Default: {slot.defaultValue.length > 80 ? `${slot.defaultValue.slice(0, 80)}…` : slot.defaultValue}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onSave}
          disabled={busy || !dirty}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--ink)] disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          {busy ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
        {isOverride && (
          <button
            onClick={onReset}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.2em] hover:border-destructive hover:text-destructive disabled:opacity-50"
            title="Reset to default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
