import { createFileRoute } from "@tanstack/react-router";
import { LevelPage } from "@/components/LevelPage";

export const Route = createFileRoute("/_authenticated/m3")({
  head: () => ({
    meta: [
      { title: "PRE O-NET ม.3 · ข้้อสอบ มัธยมศึกษาปีท่ี 3" },
      { name: "description", content: "ฝึูกข้้อสอบ O-NET ม.3 จริิงย้อนหลัง 4 วิชา คณิต ไทย อังกริษ วิทยา แบบโต้้ตอบ" },
      { property: "og:title", content: "PRE O-NET มัธยมศึกษาปีท่ี 3" },
      { property: "og:description", content: "ข้้อสอบ O-NET ม.3 จริิง 4 วิชา ทำบนจอได้ พร้้อมคำใบ้" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LevelPage level="m3" />,
});
