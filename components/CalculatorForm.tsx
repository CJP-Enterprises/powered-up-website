"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculate, type CalcInput, type CalcResult } from "@/lib/calc-nec";

type OtherLoad = { name: string; va: number };

type FormState = {
  customerName: string;
  jobAddress: string;
  jobDate: string;
  notes: string;
  squareFootage: number;
  smallApplianceCircuits: number;
  laundryCircuits: number;
  rangeVA: number;
  dishwasherVA: number;
  disposalVA: number;
  microwaveVA: number;
  dryerVA: number;
  waterHeaterVA: number;
  hvacHeatingVA: number;
  hvacCoolingVA: number;
  evChargerVA: number;
  hotTubVA: number;
  poolVA: number;
  otherFixedLoads: OtherLoad[];
};

// Numeric appliance fields that get a standard preset VA. Micah just checks the
// box to include the appliance — the typical nameplate value auto-fills and
// stays editable (same idea as the circuit counts in the General section).
// Defaults follow common NEC dwelling example values (Mike Holt / Kopperfield).
type ApplianceKey =
  | "rangeVA"
  | "dishwasherVA"
  | "disposalVA"
  | "microwaveVA"
  | "dryerVA"
  | "waterHeaterVA"
  | "hvacHeatingVA"
  | "hvacCoolingVA"
  | "evChargerVA"
  | "hotTubVA"
  | "poolVA";

type Preset = {
  key: ApplianceKey;
  label: string;
  defaultVA: number;
  note?: string;
};

const KITCHEN: Preset[] = [
  { key: "rangeVA", label: "Electric Range / Oven", defaultVA: 12000, note: "≤12 kW" },
  { key: "dishwasherVA", label: "Dishwasher", defaultVA: 1200 },
  { key: "disposalVA", label: "Garbage Disposal", defaultVA: 900 },
  { key: "microwaveVA", label: "Microwave", defaultVA: 1500 },
];

const UTILITY: Preset[] = [
  { key: "dryerVA", label: "Electric Dryer", defaultVA: 5000, note: "min 5000 · 220.54" },
  { key: "waterHeaterVA", label: "Electric Water Heater", defaultVA: 4500 },
];

const HVAC: Preset[] = [
  { key: "hvacHeatingVA", label: "Electric Heat", defaultVA: 10000 },
  { key: "hvacCoolingVA", label: "Air Conditioning", defaultVA: 3500 },
];

const EV_POOL: Preset[] = [
  { key: "evChargerVA", label: "EV Charger (Level 2, 32A)", defaultVA: 7680, note: "×125% continuous" },
  { key: "hotTubVA", label: "Hot Tub / Spa (48A)", defaultVA: 11520 },
  { key: "poolVA", label: "Pool Pump", defaultVA: 1500 },
];

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const EMPTY: FormState = {
  customerName: "",
  jobAddress: "",
  jobDate: todayISO(),
  notes: "",
  squareFootage: 0,
  smallApplianceCircuits: 2,
  laundryCircuits: 1,
  rangeVA: 0,
  dishwasherVA: 0,
  disposalVA: 0,
  microwaveVA: 0,
  dryerVA: 0,
  waterHeaterVA: 0,
  hvacHeatingVA: 0,
  hvacCoolingVA: 0,
  evChargerVA: 0,
  hotTubVA: 0,
  poolVA: 0,
  otherFixedLoads: [],
};

function toInput(f: FormState): CalcInput {
  return {
    squareFootage: f.squareFootage,
    smallApplianceCircuits: f.smallApplianceCircuits,
    laundryCircuits: f.laundryCircuits,
    dryerVA: f.dryerVA,
    rangeVA: f.rangeVA,
    waterHeaterVA: f.waterHeaterVA,
    dishwasherVA: f.dishwasherVA,
    disposalVA: f.disposalVA,
    microwaveVA: f.microwaveVA,
    hvacHeatingVA: f.hvacHeatingVA,
    hvacCoolingVA: f.hvacCoolingVA,
    evChargerVA: f.evChargerVA,
    hotTubVA: f.hotTubVA,
    poolVA: f.poolVA,
    otherFixedLoads: f.otherFixedLoads.filter((l) => l.name.trim() && l.va > 0),
  };
}

export default function CalculatorForm({ loadId }: { loadId: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [showOpt, setShowOpt] = useState(false);
  const [showStd, setShowStd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loadingSaved, setLoadingSaved] = useState(!!loadId);

  // Pre-fill from a saved calc when ?load=<id> is present.
  useEffect(() => {
    if (!loadId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/calc/${loadId}`);
        if (!res.ok) return;
        const { calculation: c } = await res.json();
        if (cancelled || !c) return;
        const jobDate =
          typeof c.job_date === "string" ? c.job_date.slice(0, 10) : todayISO();
        const other: OtherLoad[] = Array.isArray(c.other_fixed_loads)
          ? c.other_fixed_loads
          : [];
        setForm({
          customerName: c.customer_name ?? "",
          jobAddress: c.job_address ?? "",
          jobDate,
          notes: c.notes ?? "",
          squareFootage: c.square_footage ?? 0,
          smallApplianceCircuits: c.small_appliance_circuits ?? 2,
          laundryCircuits: c.laundry_circuits ?? 1,
          rangeVA: c.range_va ?? 0,
          dishwasherVA: c.dishwasher_va ?? 0,
          disposalVA: c.disposal_va ?? 0,
          microwaveVA: c.microwave_va ?? 0,
          dryerVA: c.dryer_va ?? 0,
          waterHeaterVA: c.water_heater_va ?? 0,
          hvacHeatingVA: c.hvac_heating_va ?? 0,
          hvacCoolingVA: c.hvac_cooling_va ?? 0,
          evChargerVA: c.ev_charger_va ?? 0,
          hotTubVA: c.hot_tub_va ?? 0,
          poolVA: c.pool_va ?? 0,
          otherFixedLoads: other,
        });
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadId]);

  function setNum(key: keyof FormState, value: string) {
    const n = value === "" ? 0 : Math.max(0, Math.round(Number(value)));
    setForm((f) => ({ ...f, [key]: Number.isFinite(n) ? n : 0 }));
  }

  function setText(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Toggle an appliance on/off. On → fill the standard preset VA; off → 0.
  function toggleAppliance(key: ApplianceKey, defaultVA: number, on: boolean) {
    setForm((f) => ({ ...f, [key]: on ? defaultVA : 0 }));
  }

  function setApplianceVA(key: ApplianceKey, value: string) {
    const n = value === "" ? 0 : Math.max(0, Math.round(Number(value)));
    setForm((f) => ({ ...f, [key]: Number.isFinite(n) ? n : 0 }));
  }

  function addOther() {
    setForm((f) => ({
      ...f,
      otherFixedLoads: [...f.otherFixedLoads, { name: "", va: 0 }],
    }));
  }

  function updateOther(i: number, patch: Partial<OtherLoad>) {
    setForm((f) => ({
      ...f,
      otherFixedLoads: f.otherFixedLoads.map((l, idx) =>
        idx === i ? { ...l, ...patch } : l
      ),
    }));
  }

  function removeOther(i: number) {
    setForm((f) => ({
      ...f,
      otherFixedLoads: f.otherFixedLoads.filter((_, idx) => idx !== i),
    }));
  }

  function onCalculate() {
    setResult(calculate(toInput(form)));
    setSaveMsg("");
  }

  function onNewCalc() {
    setForm({ ...EMPTY, jobDate: todayISO() });
    setResult(null);
    setSaveMsg("");
    setShowOpt(false);
    setShowStd(false);
    if (loadId) router.push("/calculator");
  }

  async function onSave() {
    const res = result ?? calculate(toInput(form));
    if (!result) setResult(res);
    if (!form.customerName.trim() || !form.jobAddress.trim()) {
      setSaveMsg("Customer name and job address are required to save.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = {
        customerName: form.customerName.trim(),
        jobAddress: form.jobAddress.trim(),
        jobDate: form.jobDate,
        notes: form.notes.trim(),
        squareFootage: form.squareFootage,
        smallApplianceCircuits: form.smallApplianceCircuits,
        laundryCircuits: form.laundryCircuits,
        dryerVA: form.dryerVA,
        rangeVA: form.rangeVA,
        waterHeaterVA: form.waterHeaterVA,
        dishwasherVA: form.dishwasherVA,
        disposalVA: form.disposalVA,
        microwaveVA: form.microwaveVA,
        hvacHeatingVA: form.hvacHeatingVA,
        hvacCoolingVA: form.hvacCoolingVA,
        evChargerVA: form.evChargerVA,
        hotTubVA: form.hotTubVA,
        poolVA: form.poolVA,
        otherFixedLoads: toInput(form).otherFixedLoads,
        result: res,
      };
      const r = await fetch("/api/calc/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        const { id } = await r.json();
        setSaveMsg(`Saved — job #${id}.`);
      } else if (r.status === 401) {
        router.push("/calculator/login");
      } else {
        setSaveMsg("Could not save. Please try again.");
      }
    } catch {
      setSaveMsg("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await fetch("/api/calc/logout", { method: "POST" });
    router.push("/calculator/login");
    router.refresh();
  }

  const applianceProps = (key: ApplianceKey, defaultVA: number, label: string, note?: string) => ({
    label,
    note,
    defaultVA,
    va: form[key] as number,
    onToggle: (on: boolean) => toggleAppliance(key, defaultVA, on),
    onVA: (v: string) => setApplianceVA(key, v),
  });

  return (
    <main style={{ background: "var(--navy)", minHeight: "80vh", padding: "40px 0 80px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div>
            <div style={eyebrow}>Powered Up LLC · Internal Tool</div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                color: "var(--cream)",
                margin: "8px 0 4px",
              }}
            >
              NEC 2026 Dwelling Load Calculator
            </h1>
            <p style={{ color: "rgba(244,239,230,0.55)", fontSize: 14 }}>
              Runs the Optional (220.82) and Standard (220.42/220.53) methods side-by-side.
              Check an appliance to add its standard load — adjust the VA if the nameplate differs.
            </p>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Link href="/calculator/history" style={linkBtn}>
              Job History →
            </Link>
            <button onClick={onLogout} style={{ ...linkBtn, color: "rgba(244,239,230,0.55)" }}>
              Log out
            </button>
          </div>
        </div>

        {loadingSaved && (
          <div style={{ ...card, marginBottom: 20, color: "rgba(244,239,230,0.6)" }}>
            Loading saved job…
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)",
            gap: 24,
            alignItems: "start",
          }}
          className="calc-grid"
        >
          {/* LEFT: inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <section style={card}>
              <h2 style={sectionTitle}>Job Info</h2>
              <div style={grid2}>
                <Field label="Customer Name">
                  <input
                    style={input}
                    value={form.customerName}
                    onChange={(e) => setText("customerName", e.target.value)}
                  />
                </Field>
                <Field label="Job Date">
                  <input
                    type="date"
                    style={input}
                    value={form.jobDate}
                    onChange={(e) => setText("jobDate", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Job Address">
                <input
                  style={input}
                  value={form.jobAddress}
                  onChange={(e) => setText("jobAddress", e.target.value)}
                />
              </Field>
              <Field label="Notes">
                <textarea
                  style={{ ...input, minHeight: 64, resize: "vertical" }}
                  value={form.notes}
                  onChange={(e) => setText("notes", e.target.value)}
                />
              </Field>
            </section>

            <section style={card}>
              <h2 style={sectionTitle}>General</h2>
              <div style={grid3}>
                <NumField
                  label="Square Footage"
                  value={form.squareFootage}
                  onChange={(v) => setNum("squareFootage", v)}
                  unit="sq ft"
                />
                <NumField
                  label="Small Appliance Circuits"
                  value={form.smallApplianceCircuits}
                  onChange={(v) => setNum("smallApplianceCircuits", v)}
                  unit="× 1500 VA"
                />
                <NumField
                  label="Laundry Circuits"
                  value={form.laundryCircuits}
                  onChange={(v) => setNum("laundryCircuits", v)}
                  unit="× 1500 VA"
                />
              </div>
            </section>

            <section style={card}>
              <h2 style={sectionTitle}>Kitchen</h2>
              <div style={applianceList}>
                {KITCHEN.map((p) => (
                  <ApplianceRow key={p.key} {...applianceProps(p.key, p.defaultVA, p.label, p.note)} />
                ))}
              </div>
            </section>

            <section style={card}>
              <h2 style={sectionTitle}>Utility</h2>
              <div style={applianceList}>
                {UTILITY.map((p) => (
                  <ApplianceRow key={p.key} {...applianceProps(p.key, p.defaultVA, p.label, p.note)} />
                ))}
              </div>
            </section>

            <section style={card}>
              <h2 style={sectionTitle}>HVAC</h2>
              <div style={applianceList}>
                {HVAC.map((p) => (
                  <ApplianceRow key={p.key} {...applianceProps(p.key, p.defaultVA, p.label, p.note)} />
                ))}
              </div>
              <p style={hint}>Larger of heating vs. cooling is used (NEC 220.60).</p>
            </section>

            <section style={card}>
              <h2 style={sectionTitle}>EV · Pool · Spa</h2>
              <div style={applianceList}>
                {EV_POOL.map((p) => (
                  <ApplianceRow key={p.key} {...applianceProps(p.key, p.defaultVA, p.label, p.note)} />
                ))}
              </div>
            </section>

            <section style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h2 style={{ ...sectionTitle, margin: 0 }}>Other Fixed Loads</h2>
                <button onClick={addOther} style={smallBtn}>
                  + Add Load
                </button>
              </div>
              {form.otherFixedLoads.length === 0 && (
                <p style={{ ...hint, marginTop: 0 }}>
                  Anything not listed above (well pump, sump pump, etc.).
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {form.otherFixedLoads.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      style={{ ...input, flex: 2 }}
                      placeholder="Name (e.g. Well Pump)"
                      value={l.name}
                      onChange={(e) => updateOther(i, { name: e.target.value })}
                    />
                    <input
                      style={{ ...input, flex: 1 }}
                      type="number"
                      min={0}
                      placeholder="VA"
                      value={l.va || ""}
                      onChange={(e) =>
                        updateOther(i, { va: Math.max(0, Math.round(Number(e.target.value) || 0)) })
                      }
                    />
                    <button
                      onClick={() => removeOther(i)}
                      style={{ ...smallBtn, color: "#DC2626", padding: "8px 10px" }}
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={onCalculate} style={primaryBtn}>
                Calculate
              </button>
              <button onClick={onSave} disabled={saving} style={secondaryBtn}>
                {saving ? "Saving…" : "Save Job"}
              </button>
              <button onClick={onNewCalc} style={ghostBtn}>
                New Calc
              </button>
            </div>
            {saveMsg && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: saveMsg.startsWith("Saved") ? "var(--yellow)" : "#DC2626",
                }}
              >
                {saveMsg}
              </div>
            )}
          </div>

          {/* RIGHT: results */}
          <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            {!result ? (
              <div style={{ ...card, textAlign: "center", color: "rgba(244,239,230,0.5)" }}>
                <p style={{ fontSize: 15 }}>
                  Enter loads and press <strong style={{ color: "var(--yellow)" }}>Calculate</strong>{" "}
                  to compare both methods.
                </p>
              </div>
            ) : (
              <>
                <div style={{ ...card, borderTop: "3px solid var(--yellow)" }}>
                  <h2 style={sectionTitle}>Recommended Service</h2>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 52,
                      lineHeight: 1,
                      color: "var(--yellow)",
                    }}
                  >
                    {result.recommendedService}
                    <span style={{ fontSize: 22, marginLeft: 4 }}>A</span>
                  </div>
                  <p style={{ ...hint, marginTop: 10 }}>
                    Based on the higher of the two methods (
                    {Math.max(result.optional.amps, result.standard.amps)} A calculated demand).
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <ResultCard
                    label="Optional Method"
                    cite="NEC 220.82"
                    va={result.optional.totalVA}
                    amps={result.optional.amps}
                    highlight={result.optional.amps >= result.standard.amps}
                  />
                  <ResultCard
                    label="Standard Method"
                    cite="NEC 220.42/220.53"
                    va={result.standard.totalVA}
                    amps={result.standard.amps}
                    highlight={result.standard.amps > result.optional.amps}
                  />
                </div>

                <div style={card}>
                  <BreakdownToggle
                    open={showOpt}
                    onToggle={() => setShowOpt((s) => !s)}
                    title="Optional Method Breakdown"
                    lines={result.optional.breakdown}
                  />
                </div>
                <div style={card}>
                  <BreakdownToggle
                    open={showStd}
                    onToggle={() => setShowStd((s) => !s)}
                    title="Standard Method Breakdown"
                    lines={result.standard.breakdown}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .calc-grid { grid-template-columns: 1fr !important; }
        }
        input[type="date"] { color-scheme: dark; }
      `}</style>
    </main>
  );
}

/* ---------- presentational helpers ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  unit = "VA",
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  unit?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={fieldLabel}>
        {label} <span style={{ color: "rgba(244,239,230,0.35)" }}>({unit})</span>
      </span>
      <input
        type="number"
        min={0}
        style={input}
        value={value === 0 ? "" : value}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

// One appliance line: check to include (auto-fills the standard VA), edit if needed.
function ApplianceRow({
  label,
  note,
  defaultVA,
  va,
  onToggle,
  onVA,
}: {
  label: string;
  note?: string;
  defaultVA: number;
  va: number;
  onToggle: (on: boolean) => void;
  onVA: (v: string) => void;
}) {
  const included = va > 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 8,
        background: included ? "rgba(255,212,0,0.06)" : "var(--navy-deep)",
        border: included
          ? "1px solid rgba(255,212,0,0.35)"
          : "1px solid rgba(244,239,230,0.10)",
        transition: "background .12s, border-color .12s",
      }}
    >
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}>
        <input
          type="checkbox"
          checked={included}
          onChange={(e) => onToggle(e.target.checked)}
          style={{ width: 17, height: 17, accentColor: "var(--yellow)", cursor: "pointer" }}
        />
        <span>
          <span style={{ fontSize: 14, color: "var(--cream)", fontWeight: 600 }}>{label}</span>
          {note && (
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "rgba(244,239,230,0.4)",
                marginTop: 1,
              }}
            >
              {note}
            </span>
          )}
        </span>
      </label>

      {included ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="number"
            min={0}
            value={va}
            onChange={(e) => onVA(e.target.value)}
            style={{ ...input, width: 96, padding: "8px 10px", textAlign: "right" }}
          />
          <span style={{ ...fieldLabel, fontSize: 10 }}>VA</span>
        </div>
      ) : (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "rgba(244,239,230,0.35)",
          }}
        >
          {defaultVA.toLocaleString()} VA
        </span>
      )}
    </div>
  );
}

function ResultCard({
  label,
  cite,
  va,
  amps,
  highlight,
}: {
  label: string;
  cite: string;
  va: number;
  amps: number;
  highlight: boolean;
}) {
  return (
    <div
      style={{
        ...card,
        padding: "18px 18px",
        border: highlight
          ? "1px solid var(--yellow)"
          : "1px solid rgba(244,239,230,0.10)",
      }}
    >
      <div style={{ ...fieldLabel, color: "var(--yellow)" }}>{label}</div>
      <div style={{ ...hint, marginTop: 2, marginBottom: 12 }}>{cite}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--cream)" }}>
        {amps}
        <span style={{ fontSize: 16 }}> A</span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "rgba(244,239,230,0.6)" }}>
        {va.toLocaleString()} VA
      </div>
    </div>
  );
}

function BreakdownToggle({
  open,
  onToggle,
  title,
  lines,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  lines: string[];
}) {
  return (
    <>
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          ...fieldLabel,
          color: "var(--cream)",
        }}
      >
        <span>{title}</span>
        <span style={{ color: "var(--yellow)" }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul
          style={{
            listStyle: "none",
            margin: "14px 0 0",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {lines.map((line, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                color:
                  i === lines.length - 1 ? "var(--yellow)" : "rgba(244,239,230,0.7)",
                fontWeight: i === lines.length - 1 ? 700 : 400,
                paddingBottom: 8,
                borderBottom:
                  i === lines.length - 1 ? "none" : "1px solid rgba(244,239,230,0.08)",
              }}
            >
              {line}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------- styles ---------- */

const card: React.CSSProperties = {
  background: "var(--navy-mid)",
  border: "1px solid rgba(244,239,230,0.10)",
  borderRadius: 12,
  padding: "22px 22px",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--yellow)",
  fontWeight: 700,
  margin: "0 0 14px",
};

const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "rgba(244,239,230,0.7)",
  fontFamily: "var(--font-mono)",
};

const input: React.CSSProperties = {
  padding: "10px 12px",
  background: "var(--navy-deep)",
  border: "1px solid rgba(244,239,230,0.18)",
  borderRadius: 8,
  color: "var(--cream)",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  outline: "none",
  width: "100%",
};

const applianceList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 12,
};

const eyebrow: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--yellow)",
  fontWeight: 700,
};

const hint: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(244,239,230,0.45)",
  marginTop: 8,
};

const primaryBtn: React.CSSProperties = {
  padding: "13px 26px",
  background: "var(--yellow)",
  color: "var(--navy-deep)",
  fontWeight: 800,
  fontSize: 14,
  borderRadius: 8,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const secondaryBtn: React.CSSProperties = {
  padding: "13px 26px",
  background: "transparent",
  color: "var(--cream)",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 8,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  border: "1px solid rgba(244,239,230,0.30)",
};

const ghostBtn: React.CSSProperties = {
  padding: "13px 20px",
  background: "transparent",
  color: "rgba(244,239,230,0.6)",
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 8,
};

const smallBtn: React.CSSProperties = {
  padding: "8px 14px",
  background: "transparent",
  color: "var(--yellow)",
  fontWeight: 700,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  borderRadius: 6,
  border: "1px solid rgba(255,212,0,0.4)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const linkBtn: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--yellow)",
};
