import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function useCartSync() {
  const syncCart = useCartStore((s) => s.syncCart);
  useEffect(() => {
    syncCart();
    const onVis = () => {
      if (document.visibilityState === "visible") syncCart();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [syncCart]);
}
