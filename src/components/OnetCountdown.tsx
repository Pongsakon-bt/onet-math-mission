import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { ONET_CALENDAR } from "@/lib/onet-calendar";

// วันสอบตามประกาศ สทศ. (ปีการศึกษา 2569)
const EXAMS = [
  { level: "ป.6", date: new Date(ONET_CALENDAR.p6.date), label: ONET_CALENDAR.p6.label, tone: "var(--primary)" },
  { level: "ม.3", date: new Date(ONET_CALENDAR.m3.date), label: ONET_CALENDAR.m3.label, tone: "var(--nav-active)" },
];

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    { v: Math.floor(s / 86400), l: "วัน" },
    { v: Math.floor((s % 86400) / 3600), l: "ชั่วโมง" },
    { v: Math.floor((s % 3600) / 60), l: "นาที" },
    { v: s % 60, l: "วินาที" },
  ];
}

export function OnetCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="mt-5 rounded-2xl border-2 border-border bg-card p-4 shadow-paper">
      <div className="flex items-center gap-2 font-semibold text-primary">
        <CalendarClock className="h-5 w-5" /> นับถอยหลังสอบ O-NET ปีการศึกษา 2569
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {EXAMS.map((e) => (
          <div key={e.level} className="rounded-xl bg-secondary p-3" style={{ ...(e.level === "ม.3" ? { ["--primary" as string]: e.tone } : {}), borderTop: `4px solid ${e.tone}` }}>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl text-primary">{e.level}</span>
              <span className="text-sm text-muted-foreground">{e.label}</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              {parts(now === null ? 0 : e.date.getTime() - now).map((p) => (
                <div key={p.l} className="rounded-lg bg-background py-2">
                  <div className="font-display text-xl tabular-nums text-primary sm:text-2xl">{now === null ? "–" : p.v}</div>
                  <div className="text-xs text-muted-foreground">{p.l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">* ประกาศผล ป.6: 11 มี.ค. 2570 · ม.3: 19 มี.ค. 2570</p>
    </section>
  );
}
