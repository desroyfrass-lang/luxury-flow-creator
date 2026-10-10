import { describe, expect, it } from "vitest";
import { refuseCjImageUrl, sniffImage } from "./pilot-image";

describe("CJ pilot image source checks", () => {
  it("accepts the two verified CJ image servers over https", () => {
    expect(refuseCjImageUrl("https://cf.cjdropshipping.com/a.jpg")).toBeNull();
    expect(refuseCjImageUrl("https://oss-cf.cjdropshipping.com/a.jpg")).toBeNull();
  });
  it("refuses look-alike, plain http, other hosts and internal addresses", () => {
    expect(refuseCjImageUrl("https://cf.cjdropshipping.com.evil.io/a.jpg")).not.toBeNull();
    expect(refuseCjImageUrl("https://evilcf.cjdropshipping.com/a.jpg")).not.toBeNull();
    expect(refuseCjImageUrl("http://cf.cjdropshipping.com/a.jpg")).not.toBeNull();
    expect(refuseCjImageUrl("https://169.254.169.254/latest")).not.toBeNull();
    expect(refuseCjImageUrl("https://localhost/a.jpg")).not.toBeNull();
    expect(refuseCjImageUrl("https://user:pw@cf.cjdropshipping.com/a.jpg")).not.toBeNull();
    expect(refuseCjImageUrl("https://cf.cjdropshipping.com:8443/a.jpg")).not.toBeNull();
    expect(refuseCjImageUrl(null)).not.toBeNull();
  });
  it("identifies real image bytes, refuses others", () => {
    expect(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpeg");
    expect(sniffImage(new TextEncoder().encode("<html>"))).toBeNull();
  });
});
