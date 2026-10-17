/* The two sites in the story. Sized in container units (cqw) so they scale with their window. */

export function OldSite() {
  return (
    <div className="relative h-full w-full" style={{ background: "#E4E7EC", color: "#5E6877", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="flex items-center justify-between" style={{ background: "#B9C2CF", padding: "1.3cqw 2.4cqw", fontSize: "1.5cqw" }}>
        <b style={{ color: "#3F4856" }}>NOOR ATELIER</b>
        <span>Home | About | Services | Gallery | Contact</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", gap: "2.4cqw", padding: "3.4cqw 2.4cqw" }}>
        <div>
          <div style={{ fontSize: "3.7cqw", fontWeight: 700, color: "#3F4856", lineHeight: 1.1 }}>Welcome to Noor Atelier</div>
          <p style={{ fontSize: "1.55cqw", marginTop: "1.6cqw", lineHeight: 1.55 }}>
            We offer hair, skin and bridal services. Call us today for more information about our packages and special offers. Walk-ins welcome. Our experienced team looks forward to meeting you.
          </p>
        </div>
        <div className="grid" style={{ gap: "1.4cqw", alignContent: "start" }}>
          <div style={{ height: "9.5cqw", background: "#C5CCD6" }} />
          <div style={{ height: "9.5cqw", background: "#C5CCD6" }} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0" style={{ background: "#B9C2CF", padding: "1.2cqw 2.4cqw", fontSize: "1.35cqw" }}>
        © 2017 Noor Atelier. All rights reserved.
      </div>
    </div>
  );
}

const STEPS = ["Arrive and settle", "A quiet consultation", "The work, unhurried", "Leave glowing"];

export function NewSite() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#211713", color: "#F3E4DA" }}>
      <div className="flex items-center justify-between" style={{ padding: "1.8cqw 3cqw" }}>
        <span className="font-display" style={{ fontSize: "1.9cqw" }}>Noor Atelier</span>
        <span style={{ background: "#D98C7A", color: "#2A1713", fontSize: "1.25cqw", padding: "0.7cqw 1.7cqw", borderRadius: 999, fontWeight: 600 }}>Book on WhatsApp</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: "3cqw", padding: "3.2cqw 3cqw 0" }}>
        <div>
          <div className="font-display" style={{ fontSize: "5.4cqw", lineHeight: 0.98, fontWeight: 700, letterSpacing: "-0.035em" }}>Your wedding morning, unhurried.</div>
          <p style={{ fontSize: "1.5cqw", opacity: 0.7, marginTop: "1.8cqw" }}>Four steps, one chair, no surprises.</p>
          <span className="inline-block" style={{ marginTop: "2.2cqw", background: "#D98C7A", color: "#2A1713", fontSize: "1.3cqw", padding: "0.9cqw 2cqw", borderRadius: 999, fontWeight: 600 }}>Book a trial</span>
        </div>
        <ol style={{ fontSize: "1.45cqw", alignSelf: "end" }}>
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3" style={{ padding: "1.1cqw 0", borderTop: "1px solid rgba(243,228,218,0.16)" }}>
              <span style={{ opacity: 0.5 }}>{i + 1}</span>{s}
            </li>
          ))}
        </ol>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex gap-1" style={{ padding: "0 3cqw 2cqw" }}>
        {["#211713", "#D98C7A", "#F3E4DA", "#7A4B3E", "#3A2620"].map((c) => (
          <span key={c} className="flex-1" style={{ height: "0.8cqw", background: c, border: "1px solid rgba(255,255,255,0.1)" }} />
        ))}
      </div>
    </div>
  );
}

export function NewSitePhone() {
  return (
    <div className="flex h-full w-full flex-col" style={{ background: "#211713", color: "#F3E4DA", padding: "9cqw" }}>
      <div style={{ fontSize: "6cqw", opacity: 0.6 }}>Noor Atelier</div>
      <div className="font-display" style={{ fontSize: "17cqw", lineHeight: 0.95, fontWeight: 700, letterSpacing: "-0.035em", marginTop: "14cqw" }}>Your wedding morning, unhurried.</div>
      <div style={{ fontSize: "6.2cqw", opacity: 0.65, marginTop: "7cqw", lineHeight: 1.35 }}>Four steps, one chair, no surprises.</div>
      <div className="mt-auto">
        <div style={{ background: "#D98C7A", color: "#2A1713", textAlign: "center", fontSize: "6.4cqw", fontWeight: 600, padding: "4cqw 0", borderRadius: 999 }}>Book on WhatsApp</div>
        <div className="flex gap-1" style={{ marginTop: "5cqw" }}>
          {["#211713", "#D98C7A", "#F3E4DA", "#7A4B3E", "#3A2620"].map((c) => (
            <span key={c} className="flex-1" style={{ height: "3cqw", background: c, border: "1px solid rgba(255,255,255,0.12)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
