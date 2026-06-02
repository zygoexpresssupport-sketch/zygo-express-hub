const testimonials = [
  {
    name: "Mohammed",
    role: "Station Manager, Wa Bus Terminal",
    text: "Bus parcels used to pile up with no system. Zygo Express gave us real-time tracking and same-day pickups — our passengers never miss a delivery now.",
    stars: 5,
  },
  {
    name: "Abena Asante",
    role: "Pharmacy Manager, Wa",
    text: "Medication delays used to cost us customers. With Zygo Express, we dispatch prescriptions across Wa in hours. It's become part of how we operate.",
    stars: 5,
  },
  {
    name: "Ibrahim Dauda",
    role: "Business Owner, Wa",
    text: "I sent a document from Wa to a client and tracked it the whole way on my phone. It arrived before I finished my tea. Zygo is just different.",
    stars: 5,
  },
];

export const Testimonials = () => (
  <section className="py-24 bg-background">
    <div className="container">
      <div className="text-center mb-12 space-y-3">
        <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">
          What people say
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Trusted across <span className="text-gradient">Wa & Upper West</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-card border border-border rounded-2xl p-6 shadow-card flex flex-col gap-4"
          >
            <div className="flex gap-1 text-yellow-400 text-lg">
              {"★".repeat(t.stars)}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed flex-1">
              "{t.text}"
            </p>
            <div className="border-t border-border pt-4">
              <div className="font-bold text-sm">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
