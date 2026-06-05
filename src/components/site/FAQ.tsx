import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I book a delivery with Zygo Express?",
    a: "Simply visit our booking page, enter your name, phone number, pickup and drop-off location in Wa. Your delivery is confirmed instantly and you receive a unique tracking ID. The whole process takes less than 60 seconds.",
  },
  {
    q: "How much does a delivery cost?",
    a: "Our pricing is zone-based and transparent. Zone 1 (0–2km) costs GHS 13, Zone 2 (2–4km) costs GHS 16, Zone 3 (4–6km) costs GHS 20, and Zone 4 (6km+) costs GHS 30. The price is calculated automatically when you enter your locations.",
  },
  {
    q: "How do I track my parcel?",
    a: "Every booking comes with a unique tracking ID (e.g. ZGX-ABC123). Enter this ID in the Track Parcel section on our website to see real-time status updates — from confirmation to pickup, in transit, and delivery.",
  },
  {
    q: "How do I pay for my delivery?",
    a: "We currently accept MTN Mobile Money (MoMo). Send payment to 0240393582 (Zygo Express) via *170# and use your tracking ID as the reference. Our team confirms payment and activates your delivery.",
  },
  {
    q: "How long does delivery take?",
    a: "We offer same-day delivery across Wa and surrounding areas. Most deliveries within Wa Municipal are completed within 1–3 hours of pickup. You can track your rider live on your phone.",
  },
  {
    q: "What areas do you currently serve?",
    a: "We currently serve Wa Municipal and surrounding communities in Upper West Region, Ghana. This includes Kpaguri, Jahan, Ssnit, Dobile, Nakori, Kparimbo, Sing, Kperisi and more. We are expanding rapidly.",
  },
  {
    q: "What types of items can I send?",
    a: "We deliver documents, parcels, food, medication, groceries, clothing and most everyday items. For fragile or oversized items, please mention this in the parcel details when booking so our rider can handle with extra care.",
  },
  {
    q: "Is Zygo Express a registered business?",
    a: "Yes. Zygo Express is a legally registered delivery business operating in Wa, Upper West Ghana. We are fully compliant and committed to professional, trustworthy service.",
  },
];

export const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container max-w-3xl">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
          <p className="text-muted-foreground">Everything you need to know about Zygo Express</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-sm md:text-base">{f.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-primary flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center p-6 bg-primary/5 border border-primary/20 rounded-2xl">
          <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
          <a
            href="https://wa.me/233240393582?text=Hello Zygo Express, I have a question about your service."
            className="inline-flex items-center gap-2 bg-green-500 text-white font-bold text-sm px-5 py-3 rounded-xl"
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};
