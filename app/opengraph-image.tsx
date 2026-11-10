import { ImageResponse } from "next/og";

export const alt = "Yakimel Empire — Websites, Shopify stores and AI for small businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The picture shown when someone shares yakimelempire.com on WhatsApp, Facebook, LinkedIn… */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "linear-gradient(180deg, #DDF1F7 0%, #B8E2EE 100%)",
          color: "#0E3B32",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}>Yakimel Empire</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>Your business, online.</div>
          <div style={{ marginTop: 28, fontSize: 36, color: "#2E4C46", maxWidth: 900 }}>
            Websites, Shopify stores, apps and AI assistants for small businesses.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
          <div style={{ display: "flex", background: "#0F4C3F", color: "white", padding: "16px 34px", borderRadius: 999, fontWeight: 700 }}>
            Book a free call
          </div>
          <div style={{ display: "flex", fontWeight: 600 }}>yakimelempire.com</div>
        </div>
      </div>
    ),
    size,
  );
}
