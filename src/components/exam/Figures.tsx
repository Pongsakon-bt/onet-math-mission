import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import type { Choice, Figure } from "@/data/exams";

export function FigureView({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case "image":
      return <ZoomImage figure={figure} />;
    case "lineVisitors":
      return <LineVisitors />;
    case "pieDrinks":
      return (
        <Pie
          title="เครื่องดื่มที่คนวัยทำงานชื่นชอบ"
          data={[
            { label: "ชาเขียว", value: 24, show: "24%" },
            { label: "กาแฟ", value: 56, show: "56%" },
            { label: "ชาเย็น", value: 6, show: "6%" },
            { label: "น้ำผลไม้", value: 12, show: "12%" },
            { label: "น้ำอัดลม", value: 2, show: "2%" },
          ]}
        />
      );
    case "pieColors":
      return (
        <Pie
          title="สัดส่วนของนักเรียนที่ชอบสีต่าง ๆ"
          data={[
            { label: "สีฟ้า", value: 16, show: "?" },
            { label: "สีแดง", value: 44, show: "44%" },
            { label: "สีเขียว", value: 11, show: "11%" },
            { label: "สีม่วง", value: 16, show: "16%" },
            { label: "สีน้ำเงิน", value: 13, show: "13%" },
          ]}
        />
      );
    case "barFlu":
      return <BarFlu />;
    case "stemLeaf":
      return <StemLeaf />;
    case "dataStrip":
      return <DataStrip />;
    case "pyramid":
      return <PyramidFigure />;
  }
}

const tones = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-xs text-muted-foreground">{children}</p>;
}

function LineVisitors() {
  const days = ["พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์", "จันทร์", "อังคาร", "พุธ"];
  const vals: number[] = [205, 220, 230, 215, 205, 215, 220];
  const v = (i: number) => vals[i] ?? 0;
  const [sel, setSel] = useState<number | null>(null);
  const W = 560, H = 280, L = 50, R = 20, T = 20, B = 50;
  const x = (i: number) => L + (i * (W - L - R)) / 6;
  const y = (v: number) => T + ((235 - v) * (H - T - B)) / 37;
  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-1 text-center text-sm font-semibold">จำนวนผู้เข้าชมพิพิธภัณฑ์แห่งหนึ่งเป็นเวลา 7 วัน</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto max-h-[34dvh] w-full md:max-h-[50dvh] landscape:max-h-[58dvh]" role="img" aria-label="กราฟเส้นจำนวนผู้เข้าชม">
        {[200, 205, 210, 215, 220, 225, 230].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--border)" />
            {v % 10 === 0 && (
              <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="12" fill="var(--muted-foreground)">{v}</text>
            )}
          </g>
        ))}
        <text x={L - 8} y={H - B + 18} textAnchor="end" fontSize="12" fill="var(--muted-foreground)">0</text>
        <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points={vals.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
        {vals.map((v, i) => (
          <g key={i} className="cursor-pointer" onClick={() => setSel(i)}>
            <circle cx={x(i)} cy={y(v)} r={sel === i ? 8 : 6} fill={sel === i ? "var(--highlight)" : "var(--primary)"} stroke="var(--card)" strokeWidth="2" />
            <circle cx={x(i)} cy={y(v)} r={18} fill="transparent" />
            <text x={x(i)} y={H - B + 22} textAnchor="middle" fontSize="12" fill="var(--foreground)">{days[i]}</text>
          </g>
        ))}
        {sel !== null && (
          <g>
            <rect x={x(sel) - 52} y={y(v(sel)) - 46} width="104" height="34" rx="6" fill="var(--foreground)" />
            <text x={x(sel)} y={y(v(sel)) - 25} textAnchor="middle" fontSize="13" fill="var(--background)">
              {v(sel)} คน{sel > 0 ? ` (${v(sel) - v(sel - 1) >= 0 ? "+" : ""}${v(sel) - v(sel - 1)})` : ""}
            </text>
          </g>
        )}
      </svg>
      <Hint>แตะจุดบนกราฟเพื่ออ่านค่า และดูว่าเพิ่มหรือลดจากวันก่อนหน้าเท่าไร</Hint>
    </div>
  );
}

function Pie({ title, data }: { title: string; data: { label: string; value: number; show: string }[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const cx = 150, cy = 150, r = 120;
  return (
    <div className="mx-auto max-w-md">
      <p className="mb-1 text-center text-sm font-semibold">{title}</p>
      <svg viewBox="0 0 300 300" className="mx-auto max-h-[30dvh] w-full max-w-xs md:max-h-[44dvh] landscape:max-h-[52dvh]" role="img" aria-label={title}>
        {data.map((d, i) => {
          const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
          acc += d.value;
          const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
          const mid = (a0 + a1) / 2;
          const off = sel === i ? 10 : 0;
          const ox = Math.cos(mid) * off, oy = Math.sin(mid) * off;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          const p = `M ${cx + ox} ${cy + oy} L ${cx + ox + r * Math.cos(a0)} ${cy + oy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + ox + r * Math.cos(a1)} ${cy + oy + r * Math.sin(a1)} Z`;
          const lr = d.value < 8 ? r + 0 : r * 0.62;
          return (
            <g key={i} className="cursor-pointer" onClick={() => setSel(sel === i ? null : i)}>
              <path d={p} fill={tones[i % tones.length]} stroke="var(--card)" strokeWidth="2" />
              <text
                x={cx + ox + lr * Math.cos(mid)}
                y={cy + oy + lr * Math.sin(mid)}
                textAnchor="middle"
                fontSize="12"
                fill="var(--foreground)"
                fontWeight={600}
              >
                <tspan x={cx + ox + lr * Math.cos(mid)} dy={d.value < 8 ? -4 : -2}>{d.label}</tspan>
                <tspan x={cx + ox + lr * Math.cos(mid)} dy="14">{d.show}</tspan>
              </text>
            </g>
          );
        })}
      </svg>
      <Hint>แตะแต่ละส่วนเพื่อดึงออกมาดูให้ชัด</Hint>
    </div>
  );
}

function BarFlu() {
  const data: [string, number][] = [
    ["0-4 ปี", 2858.7], ["5-14 ปี", 2541.15], ["15-24 ปี", 681.42], ["25-34 ปี", 648.11],
    ["35-44 ปี", 623.07], ["45-54 ปี", 413.18], ["55-64 ปี", 349.5], ["65+ ปี", 340.08],
  ];
  const [picked, setPicked] = useState<number[]>([]);
  const W = 600, H = 300, L = 50, B = 40, T = 24;
  const bw = (W - L - 10) / data.length;
  const y = (v: number) => T + (1 - v / 3000) * (H - T - B);
  const toggle = (i: number) =>
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p.slice(-1), i]));
  const [p0, p1] = picked;
  const diff = p0 !== undefined && p1 !== undefined ? Math.abs(data[p0]![1] - data[p1]![1]) : null;
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-1 text-sm text-muted-foreground">จำนวนคนป่วยต่อประชากรแสนคน</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto max-h-[34dvh] w-full md:max-h-[50dvh] landscape:max-h-[58dvh]" role="img" aria-label="แผนภูมิแท่งอัตราผู้ป่วยไข้หวัดใหญ่">
        {[0, 500, 1000, 1500, 2000, 2500, 3000].map((v) => (
          <g key={v}>
            <line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke="var(--border)" />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">{v.toLocaleString()}</text>
          </g>
        ))}
        {data.map(([lab, v], i) => (
          <g key={lab} className="cursor-pointer" onClick={() => toggle(i)}>
            <rect x={L + i * bw + bw * 0.18} y={y(v)} width={bw * 0.64} height={H - B - y(v)} rx="3"
              fill={picked.includes(i) ? "var(--highlight)" : "var(--primary)"} />
            <text x={L + i * bw + bw / 2} y={y(v) - 6} textAnchor="middle" fontSize="11" fontWeight={600} fill="var(--foreground)">
              {v.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </text>
            <text x={L + i * bw + bw / 2} y={H - B + 18} textAnchor="middle" fontSize="11" fill="var(--foreground)">{lab}</text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-sm">
        {diff !== null ? (
          <span className="rounded-md bg-highlight/40 px-2 py-1 font-semibold">
            {data[p0!]![0]} กับ {data[p1!]![0]} ต่างกัน {diff.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">แตะแท่ง 2 แท่งเพื่อให้เครื่องคิดผลต่างให้ดู</span>
        )}
      </p>
    </div>
  );
}

function StemLeaf() {
  const rows: [string, string[]][] = [["0", ["5", "7"]], ["1", ["1", "2", "4", "5"]], ["2", ["0", "1", "3"]], ["3", ["0", "2", "A"]]];
  const [a, setA] = useState(0);
  const vals = [5, 7, 11, 12, 14, 15, 20, 21, 23, 30, 32, 30 + a];
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  return (
    <div className="mx-auto max-w-sm">
      <table className="mx-auto text-lg">
        <thead>
          <tr><th className="border-r-2 border-foreground px-4 pb-1">ต้น</th><th className="px-4 pb-1 text-left">ใบ</th></tr>
        </thead>
        <tbody>
          {rows.map(([s, ls]) => (
            <tr key={s}>
              <td className="border-r-2 border-foreground px-4 text-center font-semibold">{s}</td>
              <td className="px-4 tracking-[0.6em]">
                {ls.map((l, i) => (
                  <span key={i} className={l === "A" ? "rounded bg-highlight/50 px-1 font-bold" : ""}>{l}</span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 rounded-lg border border-dashed border-border p-3">
        <label className="flex items-center gap-3 text-sm">
          <span>ลองใส่ A =</span>
          <input type="range" min={0} max={9} value={a} onChange={(e) => setA(Number(e.target.value))} className="flex-1 accent-primary" />
          <span className="w-6 text-center font-bold">{a}</span>
        </label>
        <p className="mt-1 text-center text-sm">ค่าเฉลี่ยตอนนี้ = <b>{mean.toFixed(2)}</b> ปี</p>
      </div>
    </div>
  );
}

function DataStrip() {
  const base = [98, 100, 101, 104, 109, 109, 110, 111];
  const [a, setA] = useState(111);
  return (
    <div className="mx-auto max-w-md">
      <div className="flex flex-wrap justify-center gap-2">
        {base.map((v, i) => (
          <span key={i} className="rounded-md border border-border bg-card px-3 py-1 font-semibold">{v}</span>
        ))}
        <span className="rounded-md border-2 border-highlight bg-highlight/30 px-3 py-1 font-bold italic">a</span>
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-border p-3">
        <label className="flex items-center gap-3 text-sm">
          <span>ลอง a =</span>
          <input type="range" min={111} max={120} value={a} onChange={(e) => setA(Number(e.target.value))} className="flex-1 accent-primary" />
          <span className="w-8 text-center font-bold">{a}</span>
        </label>
        <p className="mt-1 text-center text-sm">พิสัยตอนนี้ = <b>{a - 98}</b></p>
      </div>
    </div>
  );
}

export function ShapeChoice({ shape }: { shape: NonNullable<Choice["shape"]> }) {
  const pts = {
    hexagon: "20,50 40,15 80,15 100,50 80,85 40,85",
    square: "25,10 95,10 95,80 25,80",
    trapezoid: "35,15 85,15 105,85 15,85",
    triangle: "60,10 105,85 15,85",
  }[shape];
  const name = { hexagon: "รูปหกเหลี่ยม", square: "รูปสี่เหลี่ยมจัตุรัส", trapezoid: "รูปสี่เหลี่ยมคางหมู", triangle: "รูปสามเหลี่ยม" }[shape];
  return (
    <svg viewBox="0 0 120 95" className="h-16 w-20" role="img" aria-label={name}>
      <polygon points={pts} fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function PyramidFigure() {
  return (
    <svg viewBox="0 0 200 130" className="mx-auto w-48" role="img" aria-label="พีระมิดฐานสี่เหลี่ยมมุมฉาก">
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="100,10 20,100 100,118 180,95 100,10 100,118" />
        <polyline points="20,100 70,80 180,95" strokeDasharray="5 4" />
        <line x1="100" y1="10" x2="70" y2="80" strokeDasharray="5 4" />
      </g>
    </svg>
  );
}

/** Exam picture: tap to view it large; tap anywhere (or press Esc) to go back to the question. */
function ZoomImage({ figure }: { figure: Extract<Figure, { kind: "image" }> }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="group relative mx-auto block cursor-zoom-in" aria-label="ดูภาพขนาดใหญ่">
        <img
          src={figure.src}
          alt={figure.alt}
          loading="lazy"
          className="mx-auto max-h-[34dvh] w-auto max-w-full rounded-md border border-border bg-card object-contain mix-blend-multiply md:max-h-[52dvh] landscape:max-h-[60dvh]"
          style={{ maxWidth: figure.maxWidth ?? 420 }}
        />
        <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-foreground/75 px-1.5 py-0.5 text-xs text-background">
          <ZoomIn className="h-3.5 w-3.5" /> แตะเพื่อขยาย
        </span>
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={figure.alt} onClick={() => setOpen(false)}
          className="animate-in fade-in fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center gap-3 bg-foreground/85 p-3">
          <img src={figure.src} alt={figure.alt} className="max-h-[88dvh] max-w-full rounded-lg bg-card object-contain" />
          <span className="flex items-center gap-1 rounded-full bg-background px-3 py-1 text-sm font-semibold"><X className="h-4 w-4" /> แตะที่ใดก็ได้เพื่อกลับไปที่ข้อสอบ</span>
        </div>
      )}
    </>
  );
}
