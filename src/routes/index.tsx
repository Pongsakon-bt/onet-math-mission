import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";
import { useAccount } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COOL QUIZ : O-NET · เข้้าสู่ระบบเพื่่อทำข้้อสอบ" },
      { name: "description", content: "COOL QUIZ : O-NET ฝึูกทำข้้อสอบ O-NET ป.6 และ ม.3 ครบ 4 วิชา ต้้องเข้้าสู่ระบบก่่อนจึงจะเห็นชั้้นและวิชา" },
      { property: "og:title", content: "COOL QUIZ : O-NET" },
      { property: "og:description", content: "ฝึูกทำข้้อสอบ O-NET 4 วิชา แบบโต้้ตอบ ต้้องเข้้าสู่ระบบก่่อน" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

/** No public content: signed-in users go to their dashboard, everyone else sees only the nav bar. */
function Index() {
  const account = useAccount();
  const navigate = useNavigate();
  useEffect(() => {
    if (account) void navigate({ to: "/dashboard", search: { level: "p6", subject: "math" }, replace: true });
  }, [account, navigate]);
  return (
    <div className="min-h-dvh">
      <SiteNav />
    </div>
  );
}
