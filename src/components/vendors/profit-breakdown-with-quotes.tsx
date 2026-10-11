// Loads saved CJ shipping quotes (Founder/admin only) and lets the Founder request
// fresh read-only quotes. Pure math stays in ProfitBreakdownPanel.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchCjShippingQuotes, listCjShippingQuotes } from "@/lib/vendors/shipping-quotes.functions";
import { ProfitBreakdownPanel, type VariantQuotes } from "./profit-breakdown-panel";

type Props = Omit<React.ComponentProps<typeof ProfitBreakdownPanel>, "quotes" | "onFetchQuotes" | "fetchingQuotes" | "quoteError"> & { productId: string; canFetch: boolean };

export function ProfitBreakdownWithQuotes({ productId, canFetch, ...rest }: Props) {
  const qc = useQueryClient();
  const list = useServerFn(listCjShippingQuotes);
  const fetchFn = useServerFn(fetchCjShippingQuotes);
  const ids = rest.variants.map((v) => v.id);
  const key = ["cj-shipping-quotes", productId, "US"];
  const { data } = useQuery({ queryKey: key, queryFn: () => list({ data: { variantIds: ids, country: "US" } }), enabled: ids.length > 0 });
  const quotes: VariantQuotes = {};
  for (const q of data ?? []) (quotes[q.variant_id] ??= []).push(q);
  const m = useMutation({ mutationFn: () => fetchFn({ data: { productId, country: "US" } }), onSettled: () => qc.invalidateQueries({ queryKey: key }) });
  const failed = m.data?.results.filter((r) => r.error) ?? [];
  const err = m.error ? (m.error as Error).message : failed.length ? `${failed.length} variant(s) without a quote: ${failed[0].error}` : null;
  return <ProfitBreakdownPanel {...rest} quotes={quotes} onFetchQuotes={canFetch ? () => m.mutate() : undefined} fetchingQuotes={m.isPending} quoteError={err} />;
}
