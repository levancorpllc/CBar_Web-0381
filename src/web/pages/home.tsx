import { useEffect, useRef, useState } from "react";

// Frame sequence:
// 0 → cbar-07-nb (lit LED bar — intro)
// 1 → cbar-07-rotated-nb (horizontal — Optical Options)
// 2 → cbar-06-nb (housing back — Aluminium Body + Groove)
// 3 → cbar-03-nb (connector face — M8 Connector)
// 4 → cbar-new04-nb (new LED photo — IP65)
// 5 → cbar-05-nb (LED front vertical — Cree LEDs)
// 6 → cbar-05-rotated-nb (horizontal — Ø25mm)
// 7 → cbar-01-nb (diagonal — 4 Sizes)
const BASE = import.meta.env.BASE_URL;
const FRAMES = [
  `${BASE}cbar-07-nb.png`,
  `${BASE}cbar-07-rotated-nb.png`,
  `${BASE}cbar-06-nb.png`,
  `${BASE}cbar-03-nb.png`,
  `${BASE}cbar-new04-nb.png`,
  `${BASE}cbar-05-nb.png`,
  `${BASE}cbar-05-rotated-nb.png`,
  `${BASE}cbar-01-nb.png`,
];

interface Annotation {
  id: number;
  label: string;
  sublabel: string;
  // dotX/dotY: % of image container
  dotX: number;
  dotY: number;
  // angled: if true, line goes up-right at 45° to bring label above the product
  angled?: boolean;
  // vertical: if true, line goes straight up, label centered above
  vertical?: boolean;
  // verticalDown: if true, line goes straight down, label centered below (multi-line)
  verticalDown?: boolean;
  // left: if true, angled line goes up-left, label sits above-left
  left?: boolean;
  // verticalLineLength: override for vertical line length in px (default 60)
  verticalLineLength?: number;
  // angledLineLength: override diagonal line reach in px [x, y] (default [55, 44])
  angledLineLength?: [number, number];
}

const STAGES: {
  frame: number;
  annotations: Annotation[];
  title: string;
  subtitle: string;
}[] = [
  {
    // Pic 00 — cbar-07-nb (vertical LED bar, connector at top)
    frame: 0,
    annotations: [
      {
        id: 1,
        label: "Continuous and Strobe Pulse Control",
        sublabel: "Continuous · Strobe · Instantaneous trigger",
        dotX: 50,
        dotY: 8,
        angled: true,
        angledLineLength: [110, -40],
      },
    ],
    title: "Precision Control",
    subtitle: "Strobe & continuous modes with instantaneous trigger response",
  },
  {
    // Pic 01 — cbar-new04-nb (same image as old pic 05), annotation on left
    frame: 4,
    annotations: [
      {
        id: 7,
        label: "Multiple Colors",
        sublabel: "White · Red · Green\nBlue · IR · UV",
        dotX: 50,
        dotY: 50,
        left: true,
      },
    ],
    title: "Six Wavelengths",
    subtitle: "White, Red, Green, Blue, IR, UV — 50,000h LED lifetime",
  },
  {
    // Pic 02 — cbar-07-rotated-nb (horizontal bar, center)
    frame: 1,
    annotations: [
      {
        id: 2,
        label: "PMMA Diffuser",
        sublabel: "Or polarized filter — application specific",
        dotX: 50,
        dotY: 47,
        angled: true,
        angledLineLength: [70, 120],
      },
    ],
    title: "Optical Options",
    subtitle: "Transparent diffuser or polarized filter — matched to your inspection needs",
  },
  {
    // Pic 03 — cbar-01-nb (diagonal, center of bar)
    frame: 7,
    annotations: [
      {
        id: 8,
        label: "4 Sizes Available",
        sublabel: "15 cm · 30 cm · 45 cm · 60 cm",
        dotX: 50,
        dotY: 50,
        verticalDown: true,
      },
    ],
    title: "Scale to Your Need",
    subtitle: "From compact 15 cm to extended 60 cm configurations",
  },
  {
    // Pic 04 — cbar-new04-nb (LED bar vertical, center)
    frame: 4,
    annotations: [
      {
        id: 6,
        label: "IP50 Rated",
        sublabel: "Standard IP50 · IP64 option available",
        dotX: 50,
        dotY: 50,
        angled: true,
      },
    ],
    title: "IP50 Standard",
    subtitle: "IP50 standard · IP64 option available for harsher environments",
  },
  {
    // Pic 05 — cbar-03-nb (connector face, angled line to the right)
    frame: 3,
    annotations: [
      {
        id: 5,
        label: "M8 Connector · 24V",
        sublabel: "4-pin industrial · quick & secure",
        dotX: 50,
        dotY: 52,
        angled: true,
        angledLineLength: [140, 44],
      },
    ],
    title: "Plug & Go",
    subtitle: "24V industrial standard with M8 4-pin connector",
  },
  {
    // Pic 06 — cbar-06-nb (housing back vertical, center axis)
    frame: 2,
    annotations: [
      {
        id: 3,
        label: "Ø26 mm Aluminium Body",
        sublabel: "Ultra-compact · precision extruded · heat-optimised",
        dotX: 50,
        dotY: 30,
        angled: true,
      },
      {
        id: 4,
        label: "Groove — Slide Mounting",
        sublabel: "Compatible with standard bracket rails",
        dotX: 50,
        dotY: 55,
        angled: true,
      },
    ],
    title: "26 mm Compact Diameter",
    subtitle: "Precision aluminium housing with integrated mounting groove",
  },
];

interface Config {
  model: string;
  color: string;
  size: string;
  ip: string;
  diffuser: string;
  filter: string;
  lens: string;
  powerCord: string;
  quantity: string;
  notes: string;
}

const CONFIG_SECTIONS: {
  id: keyof Omit<Config, "quantity" | "notes">;
  label: string;
  stageHighlight: number[];
  options: { value: string; label: string; note?: string }[];
}[] = [
  {
    id: "model",
    label: "Model",
    stageHighlight: [0],
    options: [
      { value: "cbar-e", label: "C-Bar E", note: "Legacy model — recommended for most applications" },
      { value: "cbar-s", label: "C-Bar S", note: "Strobe 300% more powerful than C-Bar E" },
    ],
  },
  {
    id: "color",
    label: "Light Source",
    stageHighlight: [1],
    options: [
      { value: "white-4000k", label: "White 4000K (std)" },
      { value: "white-2700k", label: "White 2700K" },
      { value: "white-6500k", label: "White 6500K" },
      { value: "red-625",     label: "Red 625 nm" },
      { value: "green-530",   label: "Green 530 nm" },
      { value: "blue-480",    label: "Blue 480 nm" },
      { value: "ir-850",      label: "IR 850 nm" },
      { value: "uv-365",      label: "UV 365 nm" },
    ],
  },
  {
    id: "filter",
    label: "Filter",
    stageHighlight: [2],
    options: [
      { value: "none",      label: "None" },
      { value: "polarized", label: "Polarized" },
    ],
  },
  {
    id: "diffuser",
    label: "Diffuser",
    stageHighlight: [2],
    options: [
      { value: "clear",      label: "Clear (std)" },
      { value: "satin",      label: "Satin" },
      { value: "white-opal", label: "White Opal" },
    ],
  },
  {
    id: "lens",
    label: "Lens",
    stageHighlight: [2],
    options: [
      { value: "none",      label: "Without" },
      { value: "6deg",      label: "6°" },
      { value: "15deg",     label: "15°" },
      { value: "25deg",     label: "25°" },
      { value: "45deg",     label: "45°" },
      { value: "60deg-uv",  label: "60° (UV)" },
      { value: "70deg",     label: "70°" },
      { value: "10x50deg",  label: "10×50°" },
    ],
  },
  {
    id: "size",
    label: "Size",
    stageHighlight: [3],
    options: [
      { value: "150mm", label: "15 cm" },
      { value: "300mm", label: "30 cm" },
      { value: "450mm", label: "45 cm" },
      { value: "600mm", label: "60 cm" },
    ],
  },
  {
    id: "ip",
    label: "IP Protection",
    stageHighlight: [4],
    options: [
      { value: "ip50", label: "IP50 (standard)" },
      { value: "ip64", label: "IP64 (option)" },
    ],
  },
  {
    id: "powerCord",
    label: "Power Cord (M8-4P-F)",
    stageHighlight: [5],
    options: [
      { value: "none", label: "Not included" },
      { value: "2m",   label: "2 m" },
      { value: "5m",   label: "5 m" },
      { value: "10m",  label: "10 m" },
    ],
  },
];

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [annotationVisible, setAnnotationVisible] = useState(false);
  const [config, setConfig] = useState<Config>({
    model: "", color: "", size: "", ip: "ip50", diffuser: "clear",
    filter: "none", lens: "none", powerCord: "none",
    quantity: "1", notes: "",
  });
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleConfigChange = (key: keyof Config, value: string) =>
    setConfig(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const label = (id: string, val: string) =>
      CONFIG_SECTIONS.find(s => s.id === id)?.options.find(o => o.value === val)?.label ?? val;
    const message = [
      "C-Bar — Quote Request",
      "",
      `Model        : ${label("model", config.model) || "—"}`,
      `Light Source : ${label("color", config.color) || "—"}`,
      `Filter       : ${label("filter", config.filter)}`,
      `Diffuser     : ${label("diffuser", config.diffuser)}`,
      `Lens         : ${label("lens", config.lens)}`,
      `IP Protection: ${label("ip", config.ip)}`,
      `Power Cord   : ${label("powerCord", config.powerCord)}`,
      `Size         : ${label("size", config.size) || "—"}`,
      `Quantity     : ${config.quantity}`,
      config.notes ? `\nNotes:\n${config.notes}` : "",
    ].filter(Boolean).join("\n");
    setFormStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "a65c85ac-48fd-45dc-8b42-8ca731b26a65",
          name: contactName,
          email: contactEmail,
          subject: "C-Bar Quote Request",
          message,
        }),
      });
      const data = await res.json();
      setFormStatus(data.success ? "success" : "error");
    } catch {
      setFormStatus("error");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const rect = scrollRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const total = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      const newStage = Math.min(
        STAGES.length - 1,
        Math.floor(progress * (STAGES.length - 1) + 0.15)
      );

      if (newStage !== stage) {
        setAnnotationVisible(false);
        setTimeout(() => {
          setStage(newStage);
          setTimeout(() => setAnnotationVisible(true), 100);
        }, 150);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(() => setAnnotationVisible(true), 700);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [stage]);

  const current = STAGES[stage];
  const progressPercent = stage / (STAGES.length - 1);

  return (
    <div
      style={{
        fontFamily: "'Barlow', sans-serif",
        background: "#08091a",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* ── HERO ── */}
      <section
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(90,106,158,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(90,106,158,0.08) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "600px",
            height: "300px",
            background:
              "radial-gradient(ellipse, rgba(64,75,113,0.4) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{ position: "relative", textAlign: "center", padding: "0 24px" }}
        >
          <div
            style={{
              fontSize: "20px",
              letterSpacing: "0.35em",
              color: "#7eb3ff",
              textTransform: "uppercase",
              marginBottom: "28px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Levan · Industrial Vision
          </div>
          <h1
            style={{
              fontSize: "clamp(130px,20vw,260px)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 0.9,
              margin: "0 0 32px",
              background: "linear-gradient(135deg,#ffffff 30%,#7eb3ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            C-Bar
          </h1>
          <p
            style={{
              fontSize: "clamp(20px,3.2vw,36px)",
              color: "#8892b0",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Industrial Vision Lighting
          </p>
          <p
            style={{
              fontSize: "clamp(16px,2.2vw,24px)",
              color: "#5a6a9e",
              letterSpacing: "0.04em",
              marginBottom: "56px",
            }}
          >
            With Diffuser & Polarized filter options
          </p>
          <div
            style={{ display: "flex", gap: "40px", justifyContent: "center", flexWrap: "wrap" }}
          >
            {["Ø26mm", "IP50/64", "24V", "LEDs", "Strobe"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "18px",
                  letterSpacing: "0.2em",
                  color: "#5a6a9e",
                  borderBottom: "1px solid rgba(90,106,158,0.4)",
                  paddingBottom: "4px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            opacity: 0.5,
          }}
        >
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.3em",
              color: "#8892b0",
              textTransform: "uppercase",
            }}
          >
            Scroll to explore
          </span>
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "linear-gradient(to bottom, #7eb3ff, transparent)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      {/* ── SPECS ── */}
      <section
        style={{
          padding: "120px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "1px",
            height: "80px",
            background:
              "linear-gradient(to bottom, transparent, rgba(90,106,158,0.5))",
          }}
        />
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.4em",
              color: "#7eb3ff",
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: "16px",
            }}
          >
            Technical Specifications
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,5vw,56px)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Engineered for Precision
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2px",
          }}
        >
          {[
            { label: "Voltage", value: "24V", desc: "24Vdc ±10% industrial standard" },
            { label: "Control", value: "Strobe", desc: "Continuous lighting\n& Strobe pulse" },
            { label: "Lifetime", value: "50,000h", desc: "White · Red · IR · UV · Blue · Green" },
            { label: "Housing", value: "Aluminium", desc: "Anodised · passive cooling through body" },
            { label: "Connector", value: "M8 4-Pin", desc: "Industrial connector · quick release" },
            { label: "Diameter", value: "Ø26 mm", desc: "Compact aluminium cylindrical body" },
            { label: "Sizes", value: "×4", desc: "15 · 30 · 45 · 60 cm" },
            { label: "Protection", value: "IP50", desc: "Standard · IP64 option available" },
            { label: "Optics", value: "Filter", desc: "Clear diffuser · Polarized option" },
            { label: "FOV", value: "8 opts", desc: "Without · 6° · 15° · 25° · 45° · 60°(UV) · 70° · 10×50°" },
          ].map((spec) => (
            <div
              key={spec.label}
              style={{
                padding: "28px 24px",
                background: "rgba(64,75,113,0.08)",
                border: "1px solid rgba(90,106,158,0.15)",
                borderRadius: "12px",
                cursor: "default",
              }}
            >
              <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#5a6a9e", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "12px" }}>
                {spec.label}
              </div>
              <div style={{ fontSize: "clamp(24px,3vw,36px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#fff", letterSpacing: "0.02em", marginBottom: "8px" }}>
                {spec.value}
              </div>
              <div style={{ fontSize: "13px", color: "#8892b0", whiteSpace: "pre-line" }}>{spec.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LED WAVELENGTHS ── */}
      <section style={{ padding: "0 24px 100px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.4em", color: "#7eb3ff", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" }}>
            Light Sources
          </div>
          <h2 style={{ fontSize: "clamp(24px,4vw,48px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, margin: "0 0 12px" }}>
            Six Wavelengths
          </h2>
          <p style={{ color: "#8892b0", fontSize: "14px", maxWidth: "480px", margin: "0 auto" }}>
            High-output LEDs with a 50,000h lifetime — click a wavelength to add it to your configuration.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2px" }}>
          {[
            { name: "White",    nm: "4000K std", configValue: "white-4000k", color: "#f5f0e8", glow: "rgba(245,240,232,0.15)", desc: "Standard machine vision · 2700K & 6500K available" },
            { name: "Red",      nm: "625 nm",    configValue: "red-625",     color: "#ef4444", glow: "rgba(239,68,68,0.15)",   desc: "High contrast on dark surfaces · barcode reading" },
            { name: "Green",    nm: "530 nm",    configValue: "green-530",   color: "#4ade80", glow: "rgba(74,222,128,0.15)",  desc: "Colour contrast · surface detail" },
            { name: "Blue",     nm: "480 nm",    configValue: "blue-480",    color: "#60a5fa", glow: "rgba(96,165,250,0.15)",  desc: "High contrast · defect enhancement" },
            { name: "Infrared", nm: "850 nm",    configValue: "ir-850",      color: "#ff6b35", glow: "rgba(255,107,53,0.15)",  desc: "Through-barrier · covert imaging" },
            { name: "UV",       nm: "365 nm",    configValue: "uv-365",      color: "#a78bfa", glow: "rgba(167,139,250,0.15)", desc: "Fluorescence · defect detection" },
          ].map((led) => {
            const isSelected = config.color === led.configValue;
            return (
              <div
                key={led.name}
                onClick={() => handleConfigChange("color", led.configValue)}
                style={{
                  padding: "28px 20px",
                  background: isSelected ? led.glow.replace("0.15", "0.35") : led.glow,
                  border: `1px solid ${isSelected ? led.color + "99" : led.color + "22"}`,
                  borderRadius: "12px",
                  transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  textAlign: "center",
                  boxShadow: isSelected ? `0 0 0 2px ${led.color}55` : "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = led.glow.replace("0.15", "0.45");
                  (e.currentTarget as HTMLElement).style.borderColor = `${led.color}88`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = isSelected ? led.glow.replace("0.15", "0.35") : led.glow;
                  (e.currentTarget as HTMLElement).style.borderColor = isSelected ? `${led.color}99` : `${led.color}22`;
                }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: led.color, margin: "0 auto 16px", boxShadow: `0 0 20px ${led.color}66` }} />
                <div style={{ fontSize: "clamp(18px,2.5vw,26px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{led.name}</div>
                <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: led.color, letterSpacing: "0.15em", marginBottom: "10px" }}>{led.nm}</div>
                <div style={{ fontSize: "12px", color: "#8892b0", lineHeight: 1.4 }}>{led.desc}</div>
                {isSelected && (
                  <div style={{ marginTop: "12px", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", color: led.color, textTransform: "uppercase" }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── OPTICAL OPTIONS ── */}
      <section style={{ padding: "0 24px 100px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.4em", color: "#7eb3ff", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" }}>
            Front Optics
          </div>
          <h2 style={{ fontSize: "clamp(24px,4vw,48px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, margin: 0 }}>
            Diffuser or Polarized Filter
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: "2px" }}>
          {[
            { name: "Transparent Diffuser", configValue: "none",      icon: "◎", desc: "Homogenises the beam for even, shadow-free illumination across the full LED array. Ideal for surface inspection and texture analysis.", tags: ["Even field", "Reduced hot-spots", "Standard setup"] },
            { name: "Polarized Filter",     configValue: "polarized", icon: "⊗", desc: "Eliminates specular reflections from shiny or metallic surfaces. Combine with a cross-polarizer on the camera for glare-free imaging.", tags: ["Anti-glare", "Metallic surfaces", "Cross-pol compatible"] },
          ].map((opt) => {
            const isSelected = config.filter === opt.configValue;
            return (
              <div
                key={opt.name}
                onClick={() => handleConfigChange("filter", opt.configValue)}
                style={{
                  padding: "36px 32px",
                  background: isSelected ? "rgba(64,75,113,0.22)" : "rgba(64,75,113,0.08)",
                  border: `1px solid ${isSelected ? "rgba(126,179,255,0.5)" : "rgba(90,106,158,0.15)"}`,
                  borderRadius: "12px",
                  transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 0 0 2px rgba(126,179,255,0.25)" : "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(64,75,113,0.28)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(126,179,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = isSelected ? "rgba(64,75,113,0.22)" : "rgba(64,75,113,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = isSelected ? "rgba(126,179,255,0.5)" : "rgba(90,106,158,0.15)";
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "16px", color: "#7eb3ff" }}>{opt.icon}</div>
                <div style={{ fontSize: "clamp(20px,2.5vw,28px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.02em" }}>{opt.name}</div>
                <p style={{ color: "#8892b0", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>{opt.desc}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {opt.tags.map((t) => (
                    <span key={t} style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.15em", color: "#7eb3ff", border: "1px solid rgba(126,179,255,0.2)", padding: "4px 10px", textTransform: "uppercase" }}>{t}</span>
                  ))}
                </div>
                {isSelected && (
                  <div style={{ marginTop: "16px", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", color: "#7eb3ff", textTransform: "uppercase" }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SIZES ── */}
      <section style={{ padding: "80px 24px 120px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.4em", color: "#7eb3ff", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" }}>
            Available Configurations
          </div>
          <h2 style={{ fontSize: "clamp(24px,4vw,48px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, margin: 0 }}>
            Four Sizes. One Standard.
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {[
            { size: "15 cm", code: "C-Bar 150", configValue: "150mm", note: "Compact — tight spaces & close-range inspection", w: 72 },
            { size: "30 cm", code: "C-Bar 300", configValue: "300mm", note: "Standard — versatile all-purpose configuration", w: 144 },
            { size: "45 cm", code: "C-Bar 450", configValue: "450mm", note: "Extended — wider field-of-view applications", w: 216 },
            { size: "60 cm", code: "C-Bar 600", configValue: "600mm", note: "Full span — large surface illumination", w: 288 },
          ].map((item) => {
            const isSelected = config.size === item.configValue;
            return (
              <div
                key={item.size}
                onClick={() => handleConfigChange("size", item.configValue)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "20px 24px",
                  background: isSelected ? "rgba(64,75,113,0.2)" : "rgba(64,75,113,0.06)",
                  border: `1px solid ${isSelected ? "rgba(126,179,255,0.45)" : "rgba(90,106,158,0.12)"}`,
                  borderRadius: "12px",
                  gap: "20px",
                  transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  flexWrap: "wrap",
                  boxShadow: isSelected ? "0 0 0 2px rgba(126,179,255,0.2)" : "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(64,75,113,0.25)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(126,179,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = isSelected ? "rgba(64,75,113,0.2)" : "rgba(64,75,113,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = isSelected ? "rgba(126,179,255,0.45)" : "rgba(90,106,158,0.12)";
                }}
              >
                <div style={{ flexShrink: 0, minWidth: "72px" }}>
                  <div style={{ height: "3px", width: `${item.w * 0.5}px`, maxWidth: "100%", background: "linear-gradient(90deg, #404B71, #7eb3ff)", borderRadius: "1.5px" }} />
                </div>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#7eb3ff", letterSpacing: "0.15em", marginBottom: "4px" }}>{item.code}</div>
                  <div style={{ color: "#8892b0", fontSize: "13px" }}>{item.note}</div>
                </div>
                <div style={{ fontSize: "clamp(20px,3vw,34px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: isSelected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)", flexShrink: 0 }}>{item.size}</div>
                {isSelected && (
                  <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", color: "#7eb3ff", textTransform: "uppercase", flexShrink: 0 }}>✓</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STICKY SCROLL SECTION ── */}
      <div
        ref={scrollRef}
        style={{ height: `${STAGES.length * 25}vh`, position: "relative" }}
      >

        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
          }}
        >
          {/* BG grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(90,106,158,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(90,106,158,0.05) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* LEFT column — product viewer */}
          <div
            style={{
              flex: "0 0 58%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(60px,8vh,80px) 16px clamp(40px,6vh,60px)",
              position: "relative",
            }}
          >
            {/* Stage title */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "16px",
                transition: "opacity 0.4s, transform 0.4s",
                opacity: annotationVisible ? 1 : 0,
                transform: annotationVisible ? "translateY(0)" : "translateY(-10px)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.4em",
                  color: "#7eb3ff",
                  textTransform: "uppercase",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: "8px",
                }}
              >
                {String(stage).padStart(2, "0")} /{" "}
                {String(STAGES.length - 1).padStart(2, "0")}
              </div>
              <h2
                style={{
                  fontSize: "clamp(20px,3.5vw,40px)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  margin: 0,
                  color: "#fff",
                }}
              >
                {current.title}
              </h2>
              <p
                style={{
                  fontSize: "clamp(12px,1.4vw,14px)",
                  color: "#8892b0",
                  marginTop: "6px",
                  letterSpacing: "0.04em",
                }}
              >
                {current.subtitle}
              </p>
            </div>

            {/* Product + annotation wrapper */}
            <ProductViewer
              frameIndex={current.frame}
              annotations={current.annotations}
              annotationVisible={annotationVisible}
              showLightEffect={stage === 1}
            />

            {/* Progress bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  width: "clamp(100px,18vw,160px)",
                  height: "2px",
                  background: "rgba(90,106,158,0.2)",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPercent * 100}%`,
                    background: "linear-gradient(90deg, #404B71, #7eb3ff)",
                    borderRadius: "1px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#5a6a9e",
                  letterSpacing: "0.2em",
                }}
              >
                {Math.round(progressPercent * 100)}%
              </span>
            </div>
          </div>

          {/* RIGHT column — configurator */}
          <div
            style={{
              flex: "0 0 42%",
              borderLeft: "1px solid rgba(90,106,158,0.15)",
              overflowY: "auto",
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <ConfigPanel
              stage={stage}
              config={config}
              onChange={handleConfigChange}
              onSubmit={handleSubmit}
              contactName={contactName}
              contactEmail={contactEmail}
              formStatus={formStatus}
              onNameChange={setContactName}
              onEmailChange={setContactEmail}
            />
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section
        style={{ padding: "80px 24px 120px", textAlign: "center", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(ellipse, rgba(64,75,113,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <h2
            style={{
              fontSize: "clamp(28px,5vw,60px)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              margin: "0 0 16px",
            }}
          >
            Ready to Illuminate?
          </h2>
          <p style={{ color: "#8892b0", fontSize: "16px", marginBottom: "40px" }}>
            Contact Levan for more specific needs or applications.
          </p>
          <a
            href="https://www.levancorp.com/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "16px 48px",
              background: "#404B71",
              color: "#fff",
              textDecoration: "none",
              fontSize: "13px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              border: "1px solid rgba(126,179,255,0.2)",
              borderRadius: "10px",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#5a6a9e";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(126,179,255,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#404B71";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(126,179,255,0.2)";
            }}
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(90,106,158,0.15)",
          padding: "32px 24px",
          textAlign: "center",
          color: "#5a6a9e",
          fontSize: "12px",
          letterSpacing: "0.15em",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        © {new Date().getFullYear()} LEVAN · C-BAR INDUSTRIAL VISION LIGHTING
      </footer>

      {/* ── STICKY CONTACT BUTTON ── */}
      <a
        href="https://www.levancorp.com/contact-us"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          top: "20px",
          right: "24px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 18px",
          background: "rgba(8,9,26,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(126,179,255,0.25)",
          borderRadius: "8px",
          color: "#7eb3ff",
          textDecoration: "none",
          fontSize: "12px",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          transition: "background 0.2s, border-color 0.2s, color 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background = "rgba(64,75,113,0.85)";
          el.style.borderColor = "rgba(126,179,255,0.6)";
          el.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background = "rgba(8,9,26,0.75)";
          el.style.borderColor = "rgba(126,179,255,0.25)";
          el.style.color = "#7eb3ff";
        }}
      >
        <span style={{ fontSize: "14px", lineHeight: 1 }}>↗</span>
        Contact Us
      </a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%,-50%) scale(1.7); opacity: 0; }
        }
        /* LED color cycling — core beam */
        @keyframes ledColorCycle {
          0%        { background: rgba(245,240,232,0.95); box-shadow: 0 0 8px 4px rgba(245,240,232,0.7); }   /* White */
          8%        { background: rgba(245,240,232,0.1);  box-shadow: 0 0 4px 2px rgba(245,240,232,0.1); }   /* flash off */
          12%       { background: rgba(245,240,232,0.95); box-shadow: 0 0 8px 4px rgba(245,240,232,0.7); }   /* White back */
          20%       { background: rgba(245,240,232,0.0);  box-shadow: none; }                                /* off */
          22%       { background: rgba(255,107,53,0.95);  box-shadow: 0 0 8px 4px rgba(255,107,53,0.7); }   /* IR pulse 1 */
          25%       { background: rgba(255,107,53,0.2);   box-shadow: none; }
          27%       { background: rgba(255,107,53,0.95);  box-shadow: 0 0 8px 4px rgba(255,107,53,0.7); }   /* IR pulse 2 */
          29%       { background: rgba(255,107,53,0.2);   box-shadow: none; }
          31%       { background: rgba(255,107,53,0.95);  box-shadow: 0 0 8px 4px rgba(255,107,53,0.7); }   /* IR pulse 3 */
          40%       { background: rgba(255,107,53,0.0);   box-shadow: none; }                               /* off */
          43%       { background: rgba(167,139,250,0.95); box-shadow: 0 0 10px 5px rgba(167,139,250,0.6); } /* UV */
          55%       { background: rgba(167,139,250,0.95); box-shadow: 0 0 10px 5px rgba(167,139,250,0.6); }
          60%       { background: rgba(167,139,250,0.0);  box-shadow: none; }
          63%       { background: rgba(96,165,250,0.95);  box-shadow: 0 0 8px 4px rgba(96,165,250,0.7); }   /* Blue */
          72%       { background: rgba(96,165,250,0.95);  box-shadow: 0 0 8px 4px rgba(96,165,250,0.7); }
          74%       { background: rgba(96,165,250,0.1);   box-shadow: none; }
          76%       { background: rgba(96,165,250,0.95);  box-shadow: 0 0 8px 4px rgba(96,165,250,0.7); }   /* Blue strobe */
          80%       { background: rgba(96,165,250,0.0);   box-shadow: none; }
          83%       { background: rgba(74,222,128,0.95);  box-shadow: 0 0 8px 4px rgba(74,222,128,0.7); }   /* Green */
          93%       { background: rgba(74,222,128,0.95);  box-shadow: 0 0 8px 4px rgba(74,222,128,0.7); }
          97%       { background: rgba(74,222,128,0.0);   box-shadow: none; }
          100%      { background: rgba(245,240,232,0.95); box-shadow: 0 0 8px 4px rgba(245,240,232,0.7); }  /* back to White */
        }
        /* LED color cycling — outer bloom */
        @keyframes ledColorCycleBloom {
          0%   { background: rgba(245,240,232,0.18); }
          20%  { background: rgba(245,240,232,0.0);  }
          22%  { background: rgba(255,107,53,0.22);  }
          40%  { background: rgba(255,107,53,0.0);   }
          43%  { background: rgba(167,139,250,0.20); }
          60%  { background: rgba(167,139,250,0.0);  }
          63%  { background: rgba(96,165,250,0.22);  }
          80%  { background: rgba(96,165,250,0.0);   }
          83%  { background: rgba(74,222,128,0.20);  }
          97%  { background: rgba(74,222,128,0.0);   }
          100% { background: rgba(245,240,232,0.18); }
        }
        /* Light cone color cycle — SVG polygon fill */
        @keyframes coneColorCycle {
          0%        { fill: rgba(245,240,232,0.22); }   /* White */
          8%        { fill: rgba(245,240,232,0.04); }
          12%       { fill: rgba(245,240,232,0.22); }
          20%       { fill: rgba(245,240,232,0.0);  }
          22%       { fill: rgba(255,107,53,0.22);  }   /* IR */
          25%       { fill: rgba(255,107,53,0.04);  }
          27%       { fill: rgba(255,107,53,0.22);  }
          29%       { fill: rgba(255,107,53,0.04);  }
          31%       { fill: rgba(255,107,53,0.22);  }
          40%       { fill: rgba(255,107,53,0.0);   }
          43%       { fill: rgba(167,139,250,0.22); }   /* UV */
          60%       { fill: rgba(167,139,250,0.22); }
          62%       { fill: rgba(167,139,250,0.0);  }
          63%       { fill: rgba(96,165,250,0.22);  }   /* Blue */
          72%       { fill: rgba(96,165,250,0.22);  }
          74%       { fill: rgba(96,165,250,0.04);  }
          76%       { fill: rgba(96,165,250,0.22);  }
          80%       { fill: rgba(96,165,250,0.0);   }
          83%       { fill: rgba(74,222,128,0.22);  }   /* Green */
          93%       { fill: rgba(74,222,128,0.22);  }
          97%       { fill: rgba(74,222,128,0.0);   }
          100%      { fill: rgba(245,240,232,0.22); }
        }
        /* Fade in the effect layer */
        @keyframes ledFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

// ─── Product Viewer Component ─────────────────────────────────────────────────
function ProductViewer({
  frameIndex,
  annotations,
  annotationVisible,
  showLightEffect = false,
}: {
  frameIndex: number;
  annotations: Annotation[];
  annotationVisible: boolean;
  showLightEffect?: boolean;
}) {
  return (
    // Outer container — wider & taller for more zoom
    <div
      style={{
        position: "relative",
        width: "min(680px, 92vw)",
        height: "min(520px, 64vw, 66vh)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          bottom: "-16px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "50%",
          height: "40px",
          background: "rgba(64,75,113,0.55)",
          filter: "blur(28px)",
          borderRadius: "50%",
        }}
      />

      {/* All frames stacked, only active one visible */}
      {FRAMES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`C-Bar view ${i + 1}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "opacity 0.35s ease",
            opacity: i === frameIndex ? 1 : 0,
            filter: "drop-shadow(0 0 36px rgba(64,75,113,0.5))",
          }}
        />
      ))}

      {/* ── LED color flash effect (stage 5 only) ── */}
      {showLightEffect && (
        <>
          {/* Light cone SVG — trapezoid from bar face to flash strip */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 4,
              overflow: "visible",
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--cone-color, #f5f0e8)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--cone-color, #f5f0e8)" stopOpacity="0.0" />
              </linearGradient>
              {/* Animated color variable via filter trick — we animate the polygon fill directly */}
            </defs>
            {/* Trapezoid: narrow at bar (x=57, y=5→95), wide at strip (x=85, y=2→98) */}
            <polygon
              points="57,5 57,95 85,98 85,2"
              fill="url(#coneGrad)"
              style={{ animation: "coneColorCycle 6.5s ease-in-out infinite" }}
            />
          </svg>

          {/* Core beam — narrow vertical strip right of the bar */}
          <div style={{
            position: "absolute",
            right: "13%",
            top: "2%",
            width: "18px",
            height: "96%",
            borderRadius: "12px",
            animation: "ledColorCycle 6.5s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 5,
          }} />
          {/* Outer bloom — wide soft glow */}
          <div style={{
            position: "absolute",
            right: "5%",
            top: "2%",
            width: "clamp(60px, 12vw, 100px)",
            height: "96%",
            borderRadius: "50px",
            animation: "ledColorCycleBloom 6.5s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 4,
            filter: "blur(18px)",
          }} />
          {/* Fade-in wrapper */}
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: "transparent",
            animation: "ledFadeIn 0.6s ease forwards",
            pointerEvents: "none",
            zIndex: 6,
          }} />
        </>
      )}

      {/* Annotation overlays */}
      {annotations.map((annotation) => (
        <AnnotationDot
          key={annotation.id}
          annotation={annotation}
          visible={annotationVisible}
        />
      ))}
    </div>
  );
}

// ─── Annotation Dot ────────────────────────────────────────────────────────────
function AnnotationDot({
  annotation,
  visible,
}: {
  annotation: Annotation;
  visible: boolean;
}) {
  const angled = annotation.angled ?? false;
  const vertical = annotation.vertical ?? false;
  const verticalDown = annotation.verticalDown ?? false;
  const left = annotation.left ?? false;
  const vLineLen = annotation.verticalLineLength ?? 60;
  const [aX, aY] = annotation.angledLineLength ?? [55, 44];
  // angled: line goes up-right at ~45°, label sits above-right
  // left: line goes up-left at ~45°, label sits above-left
  // vertical: line goes straight up, label centered above
  // verticalDown: line goes straight down, label centered below
  // straight (default): horizontal line to the right, label beside it

  const LINE_LENGTH = "clamp(44px, 9vw, 80px)";

  return (
    <div
      style={{
        position: "absolute",
        left: `${annotation.dotX}%`,
        top: `${annotation.dotY}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      {/* Pulsing ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: "1px solid rgba(126,179,255,0.35)",
          animation: visible ? "ring-pulse 2s ease-in-out infinite" : "none",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s",
        }}
      />

      {/* Core dot */}
      <div
        style={{
          width: "9px",
          height: "9px",
          borderRadius: "50%",
          background: "#7eb3ff",
          boxShadow: "0 0 0 2px rgba(126,179,255,0.25), 0 0 14px rgba(126,179,255,0.5)",
          position: "relative",
          zIndex: 2,
          transition: "opacity 0.4s, transform 0.4s",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.3)",
        }}
      />

      {vertical ? (
        // ── Vertical line + label centered above ──────────────────────────
        <>
          {/* SVG vertical line going straight up */}
          <svg
            style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              overflow: "visible",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.35s ease 0.12s",
              pointerEvents: "none",
            }}
            width="1"
            height="1"
          >
            <defs>
              <linearGradient id={`annotLine${annotation.id}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#7eb3ff" />
                <stop offset="100%" stopColor="rgba(126,179,255,0.35)" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={-vLineLen}
              stroke={`url(#annotLine${annotation.id})`}
              strokeWidth="1"
            />
          </svg>

          {/* Horizontal tick at top of vertical line */}
          <div
            style={{
              position: "absolute",
              top: `${-vLineLen + 3}px`,
              left: "clamp(-20px, -4vw, -14px)",
              width: visible ? "clamp(28px, 6vw, 40px)" : "0px",
              height: "1px",
              background: "rgba(126,179,255,0.4)",
              transition: "width 0.25s ease 0.28s",
            }}
          />

          {/* Label — centered above the dot */}
          <div
            style={{
              position: "absolute",
              top: `${-vLineLen - 34}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: "clamp(150px, 32vw, 220px)",
              textAlign: "center",
              transition: "opacity 0.4s ease 0.30s",
              opacity: visible ? 1 : 0,
            }}
          >
            <div
              style={{
                fontSize: "clamp(15px,1.9vw,18px)",
                fontWeight: 600,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.08em",
                color: "#fff",
                marginBottom: "3px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {annotation.label}
            </div>
            <div
              style={{
                fontSize: "clamp(12px,1.4vw,14px)",
                color: "#8892b0",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              {annotation.sublabel}
            </div>
          </div>
        </>
      ) : verticalDown ? (
        // ── Vertical line going down + multi-size label below ─────────────
        <>
          <svg
            style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              overflow: "visible",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.35s ease 0.12s",
              pointerEvents: "none",
            }}
            width="1"
            height="1"
          >
            <defs>
              <linearGradient id={`annotLine${annotation.id}`} x1="0" y1="0" x2="0" y2="110" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7eb3ff" />
                <stop offset="100%" stopColor="rgba(126,179,255,0.35)" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="110"
              stroke={`url(#annotLine${annotation.id})`}
              strokeWidth="1"
            />
          </svg>

          {/* Horizontal tick at bottom of line */}
          <div
            style={{
              position: "absolute",
              top: "113px",
              left: "clamp(-20px, -4vw, -14px)",
              width: visible ? "clamp(28px, 6vw, 40px)" : "0px",
              height: "1px",
              background: "rgba(126,179,255,0.4)",
              transition: "width 0.25s ease 0.28s",
            }}
          />

          {/* Multi-size label below — different font sizes */}
          <div
            style={{
              position: "absolute",
              top: "124px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "clamp(180px, 40vw, 260px)",
              textAlign: "center",
              transition: "opacity 0.4s ease 0.30s",
              opacity: visible ? 1 : 0,
            }}
          >
            <div
              style={{
                fontSize: "clamp(12px,1.4vw,14px)",
                color: "#7eb3ff",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              {annotation.label}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(8px,2vw,16px)", alignItems: "baseline" }}>
              {["15", "30", "45", "60"].map((size, i) => (
                <div key={size} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: `clamp(${18 + i * 4}px, ${2.0 + i * 0.5}vw, ${26 + i * 5}px)`,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {size}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(11px,1.2vw,13px)",
                      color: "#5a6a9e",
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "0.1em",
                    }}
                  >
                    cm
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : left ? (
        // ── Angled line going up-LEFT + label above-left ──────────────────
        <>
          <svg
            style={{
              position: "absolute",
              top: "4px",
              left: "5px",
              overflow: "visible",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.35s ease 0.12s",
              pointerEvents: "none",
            }}
            width="1"
            height="1"
          >
            <defs>
              <linearGradient id={`annotLine${annotation.id}`} x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#7eb3ff" />
                <stop offset="100%" stopColor="rgba(126,179,255,0.35)" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="0"
              x2="-55"
              y2="-44"
              stroke={`url(#annotLine${annotation.id})`}
              strokeWidth="1"
            />
          </svg>

          {/* Horizontal tick going left from the end of angled line */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "60px",
              width: visible ? "clamp(24px, 5vw, 36px)" : "0px",
              height: "1px",
              background: "rgba(126,179,255,0.4)",
              transition: "width 0.25s ease 0.28s",
            }}
          />

          {/* Label — sits to the LEFT of the tick */}
          <div
            style={{
              position: "absolute",
              top: "-54px",
              right: "clamp(88px, 16vw, 104px)",
              width: "clamp(130px, 28vw, 200px)",
              textAlign: "right",
              transition: "opacity 0.4s ease 0.30s, transform 0.4s ease 0.30s",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(8px)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(15px,1.9vw,18px)",
                fontWeight: 600,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.08em",
                color: "#fff",
                marginBottom: "3px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {annotation.label}
            </div>
            <div
              style={{
                fontSize: "clamp(12px,1.4vw,14px)",
                color: "#8892b0",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.4,
                whiteSpace: "pre-line",
              }}
            >
              {annotation.sublabel}
            </div>
          </div>
        </>
      ) : angled ? (
        // ── Angled line + label above-right ───────────────────────────────
        <>
          {/* SVG diagonal line — goes up-right */}
          <svg
            style={{
              position: "absolute",
              top: "4px",
              left: "5px",
              overflow: "visible",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.35s ease 0.12s",
              pointerEvents: "none",
            }}
            width="1"
            height="1"
          >
            <defs>
              <linearGradient id={`annotLine${annotation.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7eb3ff" />
                <stop offset="100%" stopColor="rgba(126,179,255,0.35)" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="0"
              x2={aX}
              y2={-aY}
              stroke={`url(#annotLine${annotation.id})`}
              strokeWidth="1"
            />
          </svg>

          {/* Horizontal tick at the top of the angled line */}
          <div
            style={{
              position: "absolute",
              top: `${-aY + 4}px`,
              left: `${aX + 5}px`,
              width: visible ? "clamp(24px, 5vw, 36px)" : "0px",
              height: "1px",
              background: "rgba(126,179,255,0.4)",
              transition: "width 0.25s ease 0.28s",
            }}
          />

          {/* Label — sits to the right of the tick, above the product */}
          <div
            style={{
              position: "absolute",
              top: `${-aY - 10}px`,
              left: `${aX + 38}px`,
              width: "clamp(130px, 28vw, 200px)",
              textAlign: "left",
              transition: "opacity 0.4s ease 0.30s, transform 0.4s ease 0.30s",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-8px)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(15px,1.9vw,18px)",
                fontWeight: 600,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.08em",
                color: "#fff",
                marginBottom: "3px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {annotation.label}
            </div>
            <div
              style={{
                fontSize: "clamp(12px,1.4vw,14px)",
                color: "#8892b0",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              {annotation.sublabel}
            </div>
          </div>
        </>
      ) : (
        // ── Straight horizontal line + label to the right ─────────────────
        <>
          <div
            style={{
              position: "absolute",
              top: "4px",
              left: "14px",
              width: visible ? LINE_LENGTH : "0px",
              height: "1px",
              background: "linear-gradient(90deg, #7eb3ff, rgba(126,179,255,0.25))",
              transition: "width 0.35s ease 0.12s",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-16px",
              left: "clamp(54px, 10vw, 96px)",
              width: "clamp(130px, 28vw, 200px)",
              textAlign: "left",
              transition: "opacity 0.4s ease 0.22s, transform 0.4s ease 0.22s",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-10px)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(15px,1.9vw,18px)",
                fontWeight: 600,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.08em",
                color: "#fff",
                marginBottom: "3px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {annotation.label}
            </div>
            <div
              style={{
                fontSize: "clamp(12px,1.4vw,14px)",
                color: "#8892b0",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              {annotation.sublabel}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Configurator Panel ───────────────────────────────────────────────────────
function ConfigPanel({
  stage,
  config,
  onChange,
  onSubmit,
  contactName,
  contactEmail,
  formStatus,
  onNameChange,
  onEmailChange,
}: {
  stage: number;
  config: Config;
  onChange: (key: keyof Config, value: string) => void;
  onSubmit: () => void;
  contactName: string;
  contactEmail: string;
  formStatus: "idle" | "submitting" | "success" | "error";
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
}) {
  const highlighted = CONFIG_SECTIONS.filter(s => s.stageHighlight.includes(stage)).map(s => s.id);
  const ready = !!config.model && !!config.color && !!config.size && !!contactName && !!contactEmail;

  return (
    <div
      style={{
        padding: "clamp(20px,3vh,32px) clamp(20px,2.5vw,36px)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ paddingBottom: "10px", borderBottom: "1px solid rgba(90,106,158,0.15)" }}>
        <div style={{ fontSize: "12px", letterSpacing: "0.4em", color: "#7eb3ff", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "8px" }}>
          Configure
        </div>
        <div style={{ fontSize: "clamp(22px,2.4vw,30px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
          C-Bar
        </div>
      </div>

      {/* Option sections */}
      {CONFIG_SECTIONS.map(section => {
        const isHighlighted = highlighted.includes(section.id);
        return (
          <div
            key={section.id}
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              border: `1px solid ${isHighlighted ? "rgba(126,179,255,0.4)" : "rgba(90,106,158,0.12)"}`,
              background: isHighlighted ? "rgba(64,75,113,0.18)" : "transparent",
              transition: "all 0.4s ease",
            }}
          >
            <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: isHighlighted ? "#7eb3ff" : "#5a6a9e", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "10px", transition: "color 0.4s" }}>
              {section.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {section.options.map(opt => {
                const sel = config[section.id] === opt.value;
                return (
                  <div key={opt.value} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button
                      onClick={() => onChange(section.id, opt.value)}
                      style={{
                        padding: "6px 14px",
                        fontSize: "13px",
                        fontFamily: "'JetBrains Mono', monospace",
                        border: `1px solid ${sel ? "#7eb3ff" : "rgba(90,106,158,0.3)"}`,
                        borderRadius: "4px",
                        background: sel ? "rgba(126,179,255,0.15)" : "transparent",
                        color: sel ? "#7eb3ff" : "#8892b0",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt.label}
                    </button>
                    {opt.note && (
                      <div style={{ fontSize: "11px", color: "#5a6a9e", fontFamily: "'JetBrains Mono', monospace", paddingLeft: "2px", maxWidth: "180px", lineHeight: 1.3 }}>
                        {opt.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Quantity */}
      <div style={{ padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(90,106,158,0.12)" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#5a6a9e", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "10px" }}>
          Quantity
        </div>
        <input
          type="number"
          min="1"
          value={config.quantity}
          onChange={e => onChange("quantity", e.target.value)}
          style={{ width: "80px", padding: "6px 10px", background: "transparent", border: "1px solid rgba(90,106,158,0.3)", borderRadius: "4px", color: "#fff", fontSize: "15px", fontFamily: "'JetBrains Mono', monospace" }}
        />
      </div>

      {/* Notes */}
      <div style={{ padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(90,106,158,0.12)" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#5a6a9e", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "10px" }}>
          Need help? Write your comments below
        </div>
        <textarea
          value={config.notes}
          onChange={e => onChange("notes", e.target.value)}
          placeholder="Additional requirements, questions, or special configurations..."
          rows={2}
          style={{ width: "100%", padding: "8px 12px", background: "transparent", border: "1px solid rgba(90,106,158,0.3)", borderRadius: "4px", color: "#fff", fontSize: "14px", fontFamily: "'Barlow', sans-serif", resize: "vertical", boxSizing: "border-box", outline: "none" }}
        />
      </div>

      {/* Contact info */}
      <div style={{ padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(90,106,158,0.12)", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#5a6a9e", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
          Your Contact
        </div>
        <input
          type="text"
          placeholder="Name"
          value={contactName}
          onChange={e => onNameChange(e.target.value)}
          style={{ width: "100%", padding: "6px 12px", background: "transparent", border: "1px solid rgba(90,106,158,0.3)", borderRadius: "4px", color: "#fff", fontSize: "14px", fontFamily: "'Barlow', sans-serif", boxSizing: "border-box", outline: "none" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={contactEmail}
          onChange={e => onEmailChange(e.target.value)}
          style={{ width: "100%", padding: "6px 12px", background: "transparent", border: "1px solid rgba(90,106,158,0.3)", borderRadius: "4px", color: "#fff", fontSize: "14px", fontFamily: "'Barlow', sans-serif", boxSizing: "border-box", outline: "none" }}
        />
      </div>

      {/* Submit */}
      {formStatus === "success" ? (
        <div style={{ marginTop: "4px", padding: "14px 20px", borderRadius: "8px", border: "1px solid rgba(126,179,255,0.3)", background: "rgba(64,75,113,0.2)", color: "#7eb3ff", fontSize: "14px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, textAlign: "center" }}>
          Thank you for your submission, please wait 1 business day
        </div>
      ) : (
        <button
          onClick={ready && formStatus !== "submitting" ? onSubmit : undefined}
          style={{
            marginTop: "4px",
            padding: "14px 20px",
            background: ready ? "#404B71" : "rgba(64,75,113,0.2)",
            border: `1px solid ${ready ? "rgba(126,179,255,0.3)" : "rgba(90,106,158,0.15)"}`,
            borderRadius: "8px",
            color: ready ? "#fff" : "#5a6a9e",
            fontSize: "14px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600,
            cursor: ready && formStatus !== "submitting" ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          {formStatus === "submitting"
            ? "Sending…"
            : formStatus === "error"
            ? "Failed — try again"
            : ready
            ? "Request a Quote ↗"
            : "Select a model, light source & size first"}
        </button>
      )}
    </div>
  );
}
