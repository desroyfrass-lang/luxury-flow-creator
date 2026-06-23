import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { useCartStore } from "@/lib/cart-store";
import { useCustomerPhotos, useTryOnLooks, type CustomerPhoto } from "@/hooks/use-tryon";
import { generateTryOn } from "@/lib/tryon.functions";
import { toast } from "sonner";
import { Upload, Sparkles, Trash2, Camera, Loader2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/try-on")({
  head: () => ({
    meta: [
      { title: "Fitting Room — Frass" },
      { name: "description", content: "Try on items from your cart with AI." },
    ],
  }),
  component: TryOnPage,
});

const SIGNED_EXPIRY = 60 * 60 * 24 * 365;

async function uploadPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/source/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("tryon-photos")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage
    .from("tryon-photos")
    .createSignedUrl(path, SIGNED_EXPIRY);
  if (error) throw error;
  return data.signedUrl;
}

function TryOnPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: photos } = useCustomerPhotos();
  const { data: looks } = useTryOnLooks();
  const cartItems = useCartStore((s) => s.items);
  const generate = useServerFn(generateTryOn);

  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const activePhoto: CustomerPhoto | undefined =
    photos?.find((p) => p.id === selectedPhotoId) ?? photos?.[0];

  const toggleItem = (variantId: string) => {
    setSelectedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else if (next.size < 4) next.add(variantId);
      else toast.info("Up to 4 items per look");
      return next;
    });
  };

  const onUpload = async (file: File) => {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return toast.error("Sign in required");
    setUploading(true);
    try {
      const url = await uploadPhoto(file, uid);
      const isFirst = (photos?.length ?? 0) === 0;
      const { data: row, error } = await supabase
        .from("customer_photos")
        .insert({ user_id: uid, image_url: url, is_primary: isFirst, label: "My photo" })
        .select("id")
        .single();
      if (error) throw error;
      setSelectedPhotoId(row.id);
      toast.success("Photo saved");
      qc.invalidateQueries({ queryKey: ["customer_photos"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    const { error } = await supabase.from("customer_photos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (selectedPhotoId === id) setSelectedPhotoId(null);
    qc.invalidateQueries({ queryKey: ["customer_photos"] });
  };

  const runTryOn = async () => {
    if (!activePhoto) return toast.error("Add a photo first");
    if (selectedVariants.size === 0) return toast.error("Pick at least one item from your cart");
    const items = cartItems
      .filter((c) => selectedVariants.has(c.variantId))
      .map((c) => ({
        title: c.product.node.title,
        imageUrl: c.product.node.images?.edges?.[0]?.node?.url ?? "",
        variantTitle: c.variantTitle,
      }))
      .filter((i) => i.imageUrl);

    if (items.length === 0) return toast.error("Selected items have no images");

    setGenerating(true);
    try {
      await generate({
        data: {
          sourcePhotoId: activePhoto.id,
          sourcePhotoUrl: activePhoto.image_url,
          items,
        },
      });
      toast.success("Look generated");
      qc.invalidateQueries({ queryKey: ["tryon_looks"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12 lg:py-20">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">Frass Fitting Room</div>
          <h1 className="mt-3 font-display text-5xl lg:text-7xl title-glow">Try It On</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
            Upload a full-body photo of yourself, pick pieces from your cart, and let AI show you the fit.
            <span className="block mt-1 text-[10px] uppercase tracking-[0.25em]">AI preview — actual fit may vary</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Photo column */}
          <section className="lg:col-span-5 space-y-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Your photo</div>

            {activePhoto ? (
              <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/60">
                <img src={activePhoto.image_url} alt="You" className="w-full h-auto" />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
                <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Upload a clear full-body photo. Plain background, good light works best.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(photos ?? []).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhotoId(p.id)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                    (activePhoto?.id ?? "") === p.id
                      ? "border-[color:var(--gold)]"
                      : "border-border/60 hover:border-foreground/40"
                  }`}
                >
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(p.id);
                    }}
                    className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-1 opacity-0 hover:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </span>
                </button>
              ))}

              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="h-16 w-16 inline-flex items-center justify-center rounded-lg border-2 border-dashed border-border/60 text-muted-foreground hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                  e.target.value = "";
                }}
              />
            </div>
          </section>

          {/* Cart + action column */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Pick from your cart</div>
              <Link
                to="/"
                className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-[color:var(--gold)]"
              >
                Shop more →
              </Link>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Your cart is empty. Add some pieces and they'll show up here to try on.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cartItems.map((item) => {
                  const checked = selectedVariants.has(item.variantId);
                  const img = item.product.node.images?.edges?.[0]?.node?.url;
                  return (
                    <button
                      key={item.variantId}
                      onClick={() => toggleItem(item.variantId)}
                      className={`group relative overflow-hidden rounded-lg border-2 transition text-left ${
                        checked
                          ? "border-[color:var(--gold)] shadow-[0_0_0_4px_oklch(0.92_0.08_85_/_0.25)]"
                          : "border-border/60 hover:border-foreground/40"
                      }`}
                    >
                      {img && <img src={img} alt={item.product.node.title} className="w-full aspect-square object-cover" />}
                      <div className="p-2">
                        <div className="text-xs font-medium truncate">{item.product.node.title}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{item.variantTitle}</div>
                      </div>
                      {checked && (
                        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-[color:var(--gold)] text-[color:var(--ink)] inline-flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={runTryOn}
              disabled={generating || !activePhoto || selectedVariants.size === 0}
              className="lux-press w-full inline-flex items-center justify-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-4 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] disabled:opacity-40"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating your look…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate look
                </>
              )}
            </button>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground text-center">
              Takes 10–30 seconds. Best on full-body, front-facing photos.
            </p>
          </section>
        </div>

        {/* Look gallery */}
        <section className="mt-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Your looks</div>
              <h2 className="mt-1 font-display text-3xl">Saved fits</h2>
            </div>
          </div>

          {(looks ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
              Generated looks will live here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(looks ?? []).map((l) => (
                <div key={l.id} className="rounded-xl border border-border/60 bg-background/60 overflow-hidden">
                  {l.status === "ready" && l.result_url ? (
                    <img src={l.result_url} alt="Generated look" className="w-full aspect-[3/4] object-cover" />
                  ) : l.status === "failed" ? (
                    <div className="aspect-[3/4] flex items-center justify-center p-6 text-center text-xs text-muted-foreground">
                      Generation failed.{l.error ? ` ${l.error}` : ""}
                    </div>
                  ) : (
                    <div className="aspect-[3/4] flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {new Date(l.created_at).toLocaleDateString()} · {l.cart_items.length} piece
                    {l.cart_items.length !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
