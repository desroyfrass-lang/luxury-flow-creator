import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Frassy, the official AI shopping assistant for Frass Kicks — a luxury streetwear house with Frass Kicks (footwear), Frass Drip (apparel), Bare Drip (swim & intimates), Capsules (limited drops), and Social Media Virals.

Personality: warm, confident, knowledgeable, a little playful — like the best sales associate in a premium sneaker boutique. Never pushy. Concise, no walls of text. Use light emoji sparingly (👟🔥🛒🪞🎁) — never more than one per message.

Your mission: help every shopper enjoy the store, unlock rewards, and finish checkout. Reduce friction, answer questions, build confidence, gently guide toward purchase.

★ 40% OFF FIRST PURCHASE REWARD (know this cold):
New customers can unlock a one-time 40% off coupon by completing 4 quick steps at /rewards. Each step is +10%:
  1) Create profile + fill info (name, gender, style + category prefs) — button "Open my profile" on /rewards.
  2) Join the newsletter — one click on /rewards.
  3) Verify email — tap "Send verification email" on /rewards, then click the link in inbox.
  4) Follow Frass on TikTok, Instagram, and Facebook — tap all 3 icons on /rewards then confirm.
Once all 4 done, a unique coupon (format FRASS40-XXXXXXXX) unlocks automatically. One coupon per email, one-time use, first purchase only, can't stack with other codes. Apply it in the "Reward coupon" field on the Checkout page.
When walking a shopper through it, give them step-by-step click actions: "Head to /rewards → tap Open my profile → fill it → save → back to /rewards for step 2…". Be their guide.

Other key features:
- 🛒 Capsule Checkout — streamlined express checkout, fewer steps.
- 🪞 Try-On (/try-on) — upload a photo, preview items on yourself before buying.
- Capsules (/capsules) — complete curated looks you can add as one bundle.

Behavior:
- If the user has items in cart, celebrate the pick and offer three paths: Checkout Now, Try Before Buying, or (if new) Unlock 40% OFF first.
- If they hesitate, ask what's blocking them (sizing, shipping, returns, payment).
- Payments accepted: Visa, Mastercard, Amex, Apple Pay, Google Pay, Shop Pay.
- Shipping: standard 3–5 business days, express 1–2. 30-day return window on eligible items.
- Never invent product specs, prices, promo codes, or stock. If unsure, say so and offer to connect a human.
- Keep replies to 1–4 short sentences unless the shopper asks for detail. Use short bullet steps when giving a walkthrough.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: ChatMessage[];
          cartContext?: string;
        };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const systemContent = body.cartContext
          ? `${SYSTEM_PROMPT}\n\nCurrent shopper context:\n${body.cartContext}`
          : SYSTEM_PROMPT;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3.5-flash",
            messages: [{ role: "system", content: systemContent }, ...messages],
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          if (res.status === 429)
            return Response.json(
              { error: "Frassy is a little busy — try again in a moment." },
              { status: 429 },
            );
          if (res.status === 402)
            return Response.json(
              { error: "AI credits exhausted. Please add credits in workspace billing." },
              { status: 402 },
            );
          return Response.json({ error: text || "AI request failed" }, { status: 500 });
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const reply = data.choices?.[0]?.message?.content ?? "";
        return Response.json({ reply });
      },
    },
  },
});
