import type { ImgHTMLAttributes } from "react";
import { useSiteImageUrl } from "@/hooks/use-site-images";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  slot: string;
  fallback?: string;
};

/** <img> that resolves its src from the `site_images` override table, with bundled fallback. */
export function SiteImage({ slot, fallback, alt, ...rest }: Props) {
  const url = useSiteImageUrl(slot, fallback);
  return <img src={url} alt={alt ?? ""} {...rest} />;
}
