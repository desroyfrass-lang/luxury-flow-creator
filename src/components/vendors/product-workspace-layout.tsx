import { useState, type ReactNode } from "react";
import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/** Shared presentation only; product editing, saving and handoffs remain with their owners. */
export function ProductWorkspaceLayout({ title, originalName, urls, children, resolutionNote }: {
  title: string; originalName?: string | null; urls: string[]; children: ReactNode; resolutionNote?: string;
}) {
  return <div className="vendor-product-layout" data-testid="full-product-layout">
    <header className="vendor-product-heading"><h2>{title}</h2><p className="text-muted-foreground">Supplier original: {originalName ?? "Not recorded"}</p></header>
    <SupplierGallery key={urls.join("|")} urls={urls} resolutionNote={resolutionNote} />
    <div className="vendor-product-fields">{children}</div>
  </div>;
}

export function SupplierGallery({ urls, resolutionNote }: { urls: string[]; resolutionNote?: string }) {
  const [zoom, setZoom] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Record<string, [number, number]>>({});
  const [failed, setFailed] = useState<string[]>([]);
  return <section className="vendor-gallery" aria-label="Original supplier gallery">
    <h3>Original supplier images · {urls.length}</h3>
    {resolutionNote && <p className="text-muted-foreground">{resolutionNote}</p>}
    {!urls.length && <p role="status">No supplier images saved.</p>}
    {urls.map((url, i) => <figure key={`${url}-${i}`}>
      <div className="vendor-gallery-image">
        {failed.includes(url) ? <p role="status">Image {i + 1} could not load. The original URL is retained below.</p> :
          <img src={url} alt={`Supplier product photo ${i + 1}`} loading="lazy" onLoad={(e) => { const im = e.currentTarget; setDimensions((d) => ({ ...d, [url]: [im.naturalWidth, im.naturalHeight] })); }} onError={() => setFailed((f) => [...f, url])} />}
      </div>
      <figcaption><span>Image {i + 1} of {urls.length} · {dimensions[url] ? `${dimensions[url][0]} × ${dimensions[url][1]} px (browser decoded)` : "Resolution not verified"}</span>
        <Button variant="outline" aria-label={`Zoom supplier image ${i + 1}`} disabled={failed.includes(url)} onClick={() => setZoom(url)}><ZoomIn aria-hidden="true" /> Zoom</Button>
        <a href={url} target="_blank" rel="noreferrer">Original supplier image ↗</a>
      </figcaption>
      {dimensions[url] && dimensions[url][0] < 800 && <p className="text-muted-foreground">Lower-resolution source · shown at native size, not enlarged.</p>}
    </figure>)}
    <Dialog open={Boolean(zoom)} onOpenChange={(open) => { if (!open) setZoom(null); }}>
      <DialogContent className="vendor-image-dialog"><DialogTitle>Original supplier image</DialogTitle>{zoom && <><img src={zoom} alt="Selected original supplier image" /><a href={zoom} target="_blank" rel="noreferrer">Open original at native resolution ↗</a></>}</DialogContent>
    </Dialog>
  </section>;
}