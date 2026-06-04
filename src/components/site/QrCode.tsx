import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, ScanLine } from "lucide-react";
import { useRef } from "react";

export const QrCode = () => {
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/admin3.html`
    : "https://zygo-express-hub.lovable.app/admin3.html";
  const ref = useRef<HTMLDivElement>(null);

  const download = () => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const urlObj = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024; canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "zygo-express-qr.png";
      a.click();
      URL.revokeObjectURL(urlObj);
    };
    img.src = urlObj;
  };

  return (
    <section id="qr" className="py-24 bg-background">
      <div className="container max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <ScanLine className="h-4 w-4" /> Scan to ship
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Get a quote in <span className="text-gradient">seconds</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Print this QR code on flyers, business cards or shop windows. Customers scan it with any phone and land straight on the booking form.
          </p>
          <Button variant="hero" size="lg" onClick={download}>
            <Download /> Download QR
          </Button>
        </div>
        <div className="flex justify-center">
          <div ref={ref} className="p-6 bg-card rounded-3xl shadow-elegant border-4 border-primary/20">
            <QRCodeSVG
              value={url}
              size={260}
              level="H"
              marginSize={2}
              fgColor="#000000"
              bgColor="#ffffff"
            />
            <div className="mt-4 text-center text-xs font-bold tracking-wider text-muted-foreground">
              ZYGO EXPRESS · SCAN TO BOOK
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
