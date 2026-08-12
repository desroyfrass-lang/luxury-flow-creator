// FRASS-5P000 — the plain-English layout controls.
// A member never has to use this: they can just tell Frassy. It exists for the
// people who prefer buttons, and every control here says what it does.

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pin, PinOff, RotateCcw, Sliders } from "lucide-react";
import { useDailyCustomization } from "@/components/workspace/daily-customization";
import { CUSTOMIZATION_EXAMPLES } from "@/lib/daily/conversational";
import { DESIGN_BY_ID, SECTION_BY_ID, type SectionId } from "@/lib/daily/customization";

export function DailyLayoutPanel() {
  const { prefs, arrangement, update, reset } = useDailyCustomization();
  const [open, setOpen] = useState(false);
  const design = DESIGN_BY_ID[prefs.designId];

  const move = (id: SectionId, dir: -1 | 1) => {
    const order = arrangement.visible.concat(arrangement.hidden.filter((x) => !arrangement.visible.includes(x)));
    const i = order.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    update({ ...prefs, order: next });
  };

  const toggle = (list: SectionId[], id: SectionId) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  return (
    <section className="daily-layout-panel">
      <div className="daily-layout-panel-head">
        <div>
          <span className="ws-meta">
            <Sliders className="mr-1.5 inline h-3.5 w-3.5" /> Your Daily
          </span>
          <h2 className="daily-h2">{prefs.name}</h2>
          <p className="ws-meta">{design?.feel ?? "Your own arrangement."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/workspace/daily-design" className="ws-chip">
            Choose a different look
          </Link>
          <button type="button" className="ws-chip" onClick={() => setOpen((v) => !v)}>
            {open ? "Done" : "Rearrange"}
          </button>
        </div>
      </div>

      <p className="ws-meta daily-note">
        Easiest way: just tell Frassy below. For example — “{CUSTOMIZATION_EXAMPLES[0]}” or “
        {CUSTOMIZATION_EXAMPLES[1]}”. Changing the look never changes your money, your businesses or your data.
      </p>

      {open && (
        <div className="daily-layout-editor">
          <ul className="daily-layout-list">
            {arrangement.visible.concat(arrangement.hidden).map((id) => {
              const meta = SECTION_BY_ID[id];
              if (!meta) return null;
              const hidden = prefs.hidden.includes(id);
              const pinned = prefs.pinned.includes(id);
              return (
                <li key={id} className={hidden ? "is-hidden" : ""}>
                  <div>
                    <span className="daily-task-label">{meta.label}</span>
                    <p className="ws-meta">{meta.plain}</p>
                  </div>
                  <div className="daily-layout-actions">
                    <button type="button" className="ws-chip" aria-label={`Move ${meta.label} up`} onClick={() => move(id, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" className="ws-chip" aria-label={`Move ${meta.label} down`} onClick={() => move(id, 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className={`ws-chip ${pinned ? "daily-chip-on" : ""}`}
                      aria-label={pinned ? `Unpin ${meta.label}` : `Pin ${meta.label} to the top`}
                      onClick={() => update({ ...prefs, pinned: toggle(prefs.pinned, id) })}
                    >
                      {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      className={`ws-chip ${hidden ? "daily-chip-on" : ""}`}
                      aria-label={hidden ? `Show ${meta.label}` : `Hide ${meta.label}`}
                      onClick={() => update({ ...prefs, hidden: toggle(prefs.hidden, id) })}
                    >
                      {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="daily-layout-prefs">
            <label>
              <span className="ws-meta">Text size</span>
              <select
                value={prefs.textSize}
                onChange={(e) => update({ ...prefs, textSize: e.target.value as typeof prefs.textSize })}
              >
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="largest">Largest</option>
              </select>
            </label>
            <label>
              <span className="ws-meta">Spacing</span>
              <select
                value={prefs.density}
                onChange={(e) => update({ ...prefs, density: e.target.value as typeof prefs.density })}
              >
                <option value="spacious">Roomy</option>
                <option value="comfortable">Normal</option>
                <option value="compact">Tight</option>
              </select>
            </label>
            <label className="daily-layout-check">
              <input
                type="checkbox"
                checked={prefs.highContrast}
                onChange={(e) => update({ ...prefs, highContrast: e.target.checked })}
              />
              <span>Higher contrast</span>
            </label>
            <label className="daily-layout-check">
              <input
                type="checkbox"
                checked={prefs.reducedMotion}
                onChange={(e) => update({ ...prefs, reducedMotion: e.target.checked })}
              />
              <span>Less movement</span>
            </label>
            <label className="daily-layout-check">
              <input
                type="checkbox"
                checked={prefs.simplified}
                onChange={(e) => update({ ...prefs, simplified: e.target.checked })}
              />
              <span>Show me only my first {prefs.simplifiedCount} blocks</span>
            </label>
            <label>
              <span className="ws-meta">Name this Daily</span>
              <input
                type="text"
                maxLength={40}
                value={prefs.name}
                onChange={(e) => update({ ...prefs, name: e.target.value })}
              />
            </label>
          </div>

          <button type="button" className="ws-chip" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Back to Frass's recommended layout
          </button>
          <p className="ws-meta">
            Nothing here deletes anything. Security alerts, account warnings and legal notices always show, whatever
            you choose.
          </p>
        </div>
      )}
    </section>
  );
}
