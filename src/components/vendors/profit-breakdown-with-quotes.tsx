// Loads saved CJ shipping quotes and the saved Pricing Room worksheet (Founder/admin
// only), and wires read-only quote refresh + worksheet save. Math stays in the panel.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchCjShippingQuotes, listCjShippingQuotes } from "@/lib/vendors/shipping-quotes.functions";
import { getPricingWorksheet, savePricingWorksheet } from "@/lib/vendors/pricing-room.functions";
import { ProfitBreakdownPanel, type VariantQuotes } from "./profit-breakdown-panel";

type PanelProps = React.ComponentProps<typeof ProfitBreakdownPanel>;
type Props = Omit<PanelProps, "quotes" | "onFetchQuotes" | "fetchingQuotes" | "quoteError" | "initial" | "onSave" | "saving" | "saveError"> & { productId: string; canFetch: boolean };

export function ProfitBreakdownWithQuotes({ productId, canFetch, ...rest }: Props) {
  const qc = useQueryClient();
  const list = useServerFn(listCjShippingQuotes);
  const fetchFn = useServerFn(fetchCjShippingQuotes);
  const getWs = useServerFn(getPricingWorksheet);
  const saveWs = useServerFn(savePricingWorksheet);
  const ids = rest.variants.map((v) => v.id);
  const qKey = ["cj-shipping-quotes", productId, "US"];
  const wKey = ["pricing-worksheet", productId];
  const { data } = useQuery({ queryKey: qKey, queryFn: () => list({ data: { variantIds: ids, country: "US" } }), enabled: ids.length > 0 });
  const ws = useQuery({ queryKey: wKey, queryFn: () => getWs({ data: { productId } }) });
  const quotes: VariantQuotes = {};
  for (const q of data ?? []) (quotes[q.variant_id] ??= []).push(q);
  const m = useMutation({ mutationFn: () => fetchFn({ data: { productId, country: "US" } }), onSettled: () => qc.invalidateQueries({ queryKey: qKey }) });
  const save = useMutation({
    mutationFn: (p: Parameters<NonNullable<PanelProps["onSave"]>>[0]) => saveWs({ data: { productId, ...p } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: wKey }),
  });
  const failed = m.data?.results.filter((r) => r.error) ?? [];
  const err = m.error ? (m.error as Error).message : failed.length ? `${failed.length} variant(s) without a quote: ${failed[0].error}` : null;

  if (ws.isLoading) return <p className="mt-3 text-base text-muted-foreground">Opening the Pricing Room…</p>;
  if (ws.error) return <p className="mt-3 text-base text-destructive">The Pricing Room could not load: {(ws.error as Error).message}</p>;
  return (
    <ProfitBreakdownPanel
      key={ws.data?.updatedAt ?? "new"}
      {...rest}
      quotes={quotes}
      onFetchQuotes={canFetch ? () => m.mutate() : undefined}
      fetchingQuotes={m.isPending}
      quoteError={err}
      initial={ws.data ?? null}
      onSave={(p) => save.mutate(p)}
      saving={save.isPending}
      saveError={save.error ? (save.error as Error).message : null}
    />
  );
}
