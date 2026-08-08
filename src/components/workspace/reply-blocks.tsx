// Reading experience — long replies format into sections, bullets, callouts
// and decision boxes instead of one giant block of text.

export function ReplyBlocks({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (!bullets.length) return;
    out.push(
      <ul key={key} className="ws-bullets">
        {bullets.map((b, i) => (
          <li key={i}>{inline(b)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush(`u${i}`);
      return;
    }
    if (/^#{1,6}\s/.test(line)) {
      flush(`u${i}`);
      out.push(
        <h3 key={i} className="ws-reply-head">
          {line.replace(/^#{1,6}\s/, "")}
        </h3>,
      );
      return;
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      bullets.push(line.replace(/^\s*[-*•]\s+/, ""));
      return;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      bullets.push(line.replace(/^\s*\d+[.)]\s+/, ""));
      return;
    }
    flush(`u${i}`);
    // A line that asks for a decision becomes a decision box.
    if (/\?\s*$/.test(line) && line.length < 240) {
      out.push(
        <p key={i} className="ws-decision">
          {inline(line)}
        </p>,
      );
      return;
    }
    out.push(
      <p key={i} className="ws-reply-p">
        {inline(line)}
      </p>,
    );
  });
  flush("uend");

  return <div className="space-y-2">{out}</div>;
}

function inline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
