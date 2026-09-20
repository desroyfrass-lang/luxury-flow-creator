import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Camera, Plus, Store, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchPending } from "@/components/launch-mode-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ALLOCATION_NOTE,
  LISTING_KINDS,
  UNLIMITED_KINDS,
  kindLabel,
  money,
  remaining,
  settle,
  type ListingKind,
} from "@/lib/card-commerce";
import { EXPECTED_ALLOCATION_NOTE } from "@/lib/finance/allocation";
import {
  BASE_REPORTING_CURRENCY,
  CONFIGURED_MARKET_CURRENCIES,
  REPORTING_CURRENCY_NOTE,
} from "@/lib/finance/currency";

import { uploadCardPhoto } from "@/lib/card-media";
import {
  createListing,
  listMyCardOrders,
  listMyListings,
  setCardOrderStatus,
  setListingStatus,
} from "@/lib/card-commerce.functions";
import { linkWorkResult, updateWorkItem } from "@/lib/daily/work.functions";

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

/** FRASS-0427 — Quick Sell: photo, price, quantity. Nothing else required. */
export function QuickSellPanel({
  provider,
  launchPending = false,
  workItemId = null,
}: {
  provider?: string | null;
  /** FRASS-0462 — payments are intentionally off until Frass launches. */
  launchPending?: boolean;
  /** Money Moves sent the member here: link what they list back to that work. */
  workItemId?: string | null;
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyListings);
  const createFn = useServerFn(createListing);
  const linkWorkFn = useServerFn(updateWorkItem);
  const linkResultFn = useServerFn(linkWorkResult);
  const statusFn = useServerFn(setListingStatus);
  const ordersFn = useServerFn(listMyCardOrders);
  const orderStatusFn = useServerFn(setCardOrderStatus);

  const { data: listings } = useQuery({ queryKey: ["card-listings"], queryFn: () => listFn() });
  const { data: orders } = useQuery({ queryKey: ["card-orders"], queryFn: () => ordersFn() });

  const [kind, setKind] = useState<ListingKind>("product");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  // The customer pays in their own market currency; USD is only the default.
  const [currency, setCurrency] = useState<string>(BASE_REPORTING_CURRENCY);
  const [quantity, setQuantity] = useState("1");
  const [uploading, setUploading] = useState(false);

  const onPickPhoto = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      setImageUrl(await uploadCardPhoto(file));
      toast.success("Photo attached.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That photo could not be uploaded.");
    } finally {
      setUploading(false);
    }
  };

  const unlimited = UNLIMITED_KINDS.includes(kind);
  const preview = settle(Number(price) || 0, 1, provider, currency);

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          kind,
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          price: Number(price) || 0,
          currency,
          quantity: unlimited ? null : Math.max(1, Number(quantity) || 1),
          is_quick_sell: true,
        },
      }),
    onSuccess: async (listing) => {
      // Money Moves sent this member here — tie the listing to that work item so
      // Daily and the Workshop can show its real state instead of guessing.
      if (workItemId && listing?.id) {
        try {
          await linkWorkFn({ data: { id: workItemId, sourceRef: listing.id } });
          // Step 4: the same listing, recorded as the real saved result. No money implied.
          await linkResultFn({
            data: { workItemId, kind: "card-listing", resultRef: listing.id },
          });
          qc.invalidateQueries({ queryKey: ["work-items"] });
          qc.invalidateQueries({ queryKey: ["daily-board"] });
        } catch {
          /* the listing is live either way — never block the sale on the link */
        }
      }
      qc.invalidateQueries({ queryKey: ["card-listings"] });
      setTitle("");
      setDescription("");
      setImageUrl("");
      setPrice("");
      setQuantity("1");
      toast.success("Live on your card. Anyone holding your link can buy it right now.");
    },
    onError: (e: Error) => toast.error(e.message || "Could not publish that item."),
  });

  const archive = useMutation({
    mutationFn: (id: string) => statusFn({ data: { id, status: "archived" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["card-listings"] }),
  });

  const markOrder = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "cancelled" }) =>
      orderStatusFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-orders"] });
      qc.invalidateQueries({ queryKey: ["card-listings"] });
    },
  });

  return (
    <>
      <section className={panel}>
        <h2 className={heading}>
          <Camera className="mr-2 inline h-3.5 w-3.5" /> Quick Sell
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Photo, price, quantity — that is the whole flow. The moment you publish, your card becomes a
          checkout for that item.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <strong>Here's the takeaway:</strong> it is a market stall you can open in ten
          seconds and close when the last one is gone.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs">What are you selling?</Label>
            <select
              className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as ListingKind)}
            >
              {LISTING_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label} — {k.plain}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Hand-finished chrome tee" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Photo</Label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="ws-chip cursor-pointer text-xs">
                <Camera className="h-3.5 w-3.5" />
                {uploading ? "Uploading…" : "Take photo"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
                />
              </label>
              <label className="ws-chip cursor-pointer text-xs">
                <Upload className="h-3.5 w-3.5" /> Choose photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
                />
              </label>
              {imageUrl && (
                <img src={imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
              )}
            </div>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="…or paste a photo link" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Price</Label>
              <div className="flex gap-2">
                <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="45.00" />
                <select
                  aria-label="Currency"
                  className="rounded-md border border-border/60 bg-background px-2 text-sm"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CONFIGURED_MARKET_CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{unlimited ? "Unlimited" : "Quantity"}</Label>
              <Input
                inputMode="numeric"
                disabled={unlimited}
                value={unlimited ? "" : quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={unlimited ? "No limit" : "3"}
              />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea rows={2} maxLength={600} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border/60 p-4 text-sm">
          <p className="font-medium">On a {money(preview.gross, preview.currency)} sale — expected split (not verified yet)</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li className="text-foreground">Yours to use: {money(preview.netToSeller, preview.currency)} (90% less your provider&apos;s estimated fee)</li>
            <li>Frass ecosystem: {money(preview.platformFee, preview.currency)} (10% in total)</li>
            <li>Frass infrastructure: {money(preview.infrastructure, preview.currency)} (3%) · Reserve Vault, held by Frass: {money(preview.reserve, preview.currency)} (3%) · Frass Foundation: {money(preview.foundation, preview.currency)} (2%) · Founder: {money(preview.founder, preview.currency)} (1%) · Co-Founder: {money(preview.coFounder, preview.currency)} (1%)</li>
            <li>Estimated processing fee: {money(preview.processingFeeEstimate, preview.currency)} (charged by your own provider, an estimate only)</li>
            <li>{ALLOCATION_NOTE}</li>
            <li>{EXPECTED_ALLOCATION_NOTE}</li>
            <li>{REPORTING_CURRENCY_NOTE}</li>
          </ul>
        </div>


        {launchPending && (
          <div className="mt-4 rounded-xl border border-[color:var(--gold,#d4af37)]/35 bg-[color:var(--gold,#d4af37)]/[0.07] p-3 text-sm">
            <LaunchPending />
            <p className="mt-2 text-muted-foreground">
              Keep building your shelf. Selling switches on automatically the day Frass launches.
            </p>
          </div>
        )}

        <Button
          className="mt-4"
          disabled={!title.trim() || create.isPending}
          onClick={() => create.mutate()}
        >
          <Plus className="mr-2 h-4 w-4" />
          {create.isPending ? "Publishing…" : "Publish to my card"}
        </Button>
      </section>

      <section className={panel}>
        <h2 className={heading}>
          <Store className="mr-2 inline h-3.5 w-3.5" /> On sale from my card
        </h2>
        {(listings ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing listed yet. Zeros stay honest.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(listings ?? []).map((l) => {
              const left = remaining(l.quantity, l.sold);
              return (
                <div key={l.id} className="flex gap-3 rounded-xl border border-border/60 p-3">
                  {l.image_url && (
                    <img src={l.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {kindLabel(l.kind)} · {money(Number(l.price), l.currency)} ·{" "}
                      {left == null ? "unlimited" : `${left} left`} · {l.status.replace("_", " ")}
                    </p>
                    <button
                      className="ws-chip mt-2 text-xs"
                      onClick={() => archive.mutate(l.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={panel}>
        <h2 className={heading}>Card sales</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every sale from your card is recorded here and flows into your Financial Center — income,
          allocation and tax position included.
        </p>
        {(orders ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No card sales yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {(orders ?? []).map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {money(Number(o.subtotal), o.currency)} · {o.quantity}× ·{" "}
                    <span className="text-muted-foreground">{o.status}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.buyer_name || o.buyer_email || "Buyer not named"} · net {money(Number(o.net_to_seller), o.currency)}
                  </p>
                </div>
                {o.status === "pending" && (
                  <div className="flex flex-col items-end gap-1">
                    <button className="ws-chip text-xs" onClick={() => markOrder.mutate({ id: o.id, status: "cancelled" })}>
                      Cancel order
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      Only the payment provider can confirm this as paid.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
