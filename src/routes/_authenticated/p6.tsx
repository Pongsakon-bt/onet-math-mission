import { createFileRoute } from "@tanstack/react-router";
import { LevelPage } from "@/components/LevelPage";

export const Route = createFileRoute("/_authenticated/p6")({
  head: () => ({
    meta: [
      { title: "PRE O-NET ป.6 · ข้้อสอบ ประถมศึกษาปีท่ี 6" },
      { name: "description", content: "ฝึูกข้้อสอบ O-NET ป.6 จริิงย้อนหลัง 4 วิชา คณิต ไทย อังกริษ วิทยา แบบโต้้ตอบ" },
      { property: "og:title", content: "PRE O-NET ประถมศึกษาปีท่ี 6" },
      { property: "og:description", content: "ข้้อสอบ O-NET ป.6 จริิง 4 วิชา ทำบนจอได้ พร้้อมคำใบ้" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LevelPage level="p6" />,
});
