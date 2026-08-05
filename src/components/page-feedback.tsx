import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ThumbsUp, ThumbsDown, Flag, Send, X, CheckCircle2 } from "lucide-react";
import { submitPageFeedback } from "@/lib/feedback.functions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PageFeedbackProps {
  pageTitle?: string;
}

export function PageFeedback({ pageTitle }: PageFeedbackProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [showIssue, setShowIssue] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const sendFeedback = useServerFn(submitPageFeedback);

  const handleVote = async (value: boolean) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await sendFeedback({
        data: {
          pagePath: typeof window !== "undefined" ? window.location.pathname : "",
          pageTitle,
          helpful: value,
        },
      });
      setHelpful(value);
      setSubmitted(true);
    } catch (err) {
      // Silent fail — still show thanks so the user isn't annoyed
      setHelpful(value);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueSubmit = async () => {
    if (!issueText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await sendFeedback({
        data: {
          pagePath: typeof window !== "undefined" ? window.location.pathname : "",
          pageTitle,
          helpful: null,
          issueText: issueText.trim(),
        },
      });
      setIssueText("");
      setShowIssue(false);
      setSubmitted(true);
    } catch (err) {
      setShowIssue(false);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && !showIssue) {
    return (
      <div className="w-full border-t border-border/60 bg-background/50 py-8">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <CheckCircle2 className="mx-auto h-6 w-6 text-[color:var(--gold)]" />
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks for helping us improve Frass Kicks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-t border-border/60 bg-background/50 py-8">
      <div className="mx-auto max-w-3xl px-6">
        {!showIssue ? (
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm font-medium tracking-wide text-foreground/90">
              Was this page helpful?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleVote(true)}
                disabled={submitting}
                aria-label="This page was helpful"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  helpful === true
                    ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                    : "border-border bg-background/70 text-muted-foreground hover:border-[color:var(--gold)]/60 hover:text-foreground"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleVote(false)}
                disabled={submitting}
                aria-label="This page was not helpful"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  helpful === false
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border bg-background/70 text-muted-foreground hover:border-destructive/60 hover:text-foreground"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowIssue(true)}
                disabled={submitting}
                className="ml-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:border-[color:var(--gold)]/60 hover:text-foreground"
              >
                <Flag className="h-3.5 w-3.5" />
                Report an issue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide text-foreground/90">
                Report an issue with this page
              </p>
              <button
                type="button"
                onClick={() => setShowIssue(false)}
                aria-label="Close issue report"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              placeholder="What went wrong? Be as specific as you can."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              maxLength={2000}
              rows={4}
              className="resize-none border-border/70 bg-background/80 text-sm"
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowIssue(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleIssueSubmit}
                disabled={!issueText.trim() || submitting}
                className="gap-2 bg-[color:var(--gold)] text-[color:var(--gold-foreground)] hover:bg-[color:var(--gold)]/90"
              >
                <Send className="h-3.5 w-3.5" />
                Send report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
