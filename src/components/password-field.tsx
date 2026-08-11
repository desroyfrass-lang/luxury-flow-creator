import { useState } from "react";
import { Check, X, Eye, EyeOff } from "lucide-react";

/**
 * FRASS-0466 (#5) — password rules are shown while typing, never discovered by
 * trial and error after a failed submit.
 */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "letter", label: "One letter", test: (v: string) => /[a-zA-Z]/.test(v) },
  { id: "number", label: "One number", test: (v: string) => /\d/.test(v) },
  {
    id: "common",
    label: "Not an obvious password (password, 12345678, qwerty…)",
    test: (v: string) =>
      !/^(password\d*|12345678|123456789|qwerty\w*|letmein|iloveyou|welcome\d*)$/i.test(v.trim()),
  },
] as const;

export function passwordIsValid(value: string) {
  return PASSWORD_RULES.every((r) => r.test(value));
}

export function PasswordField({
  value,
  onChange,
  placeholder = "Password",
  showRules = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showRules?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const touched = value.length > 0;

  return (
    <div>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby="password-rules"
          className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 pr-12 text-sm outline-none focus:border-[color:var(--gold)]"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {showRules && (
        <ul id="password-rules" className="mt-3 space-y-1.5">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(value);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-2 text-[11px] ${
                  !touched
                    ? "text-muted-foreground"
                    : ok
                      ? "text-[color:var(--gold)]"
                      : "text-muted-foreground"
                }`}
              >
                {touched && ok ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : (
                  <X className="h-3 w-3 opacity-40" aria-hidden />
                )}
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
