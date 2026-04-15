# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Family Hub - Frontend

แอปพลิเคชัน Next.js สำหรับจัดการข้อมูลครอบครัว

## Tech Stack

| เทคโนโลยี | เวอร์ชัน |
|---|---|
| Next.js | ^16.2.3 (App Router, Turbopack) |
| React | ^19 |
| TypeScript | ^5 (strict mode) |
| Tailwind CSS | ^3.4 (CSS Variables สำหรับ theming) |
| shadcn/ui | latest (บน Radix UI) |
| TanStack Query | ^5 |

## คำสั่งที่ใช้บ่อย

```bash
npm run dev        # รัน dev server (Turbopack)
npm run build      # Build production
npm run lint       # ESLint via next lint

# เพิ่ม shadcn/ui component
npx shadcn@latest add [component-name]
```

## สถาปัตยกรรมหลัก

### Data Persistence
**ข้อมูลยังไม่มีการ persist** — hooks เช่น `useCarExpenses` และ `useTravelExpenses` ใช้ `useState` ล้วนๆ ข้อมูลหายเมื่อ refresh หน้า ยังไม่มี backend หรือ database เชื่อมต่อ

### การใช้ TanStack Query
ใช้เฉพาะกับ API routes เช่น `useGasPrice` (`/api/gas-price`) ส่วน feature hooks อื่นๆ ยังคงใช้ `useState` โดยตรง

### API Route
- `/api/gas-price` — จำลองราคาน้ำมัน Shell Thailand แบบ deterministic (ไม่ได้ call external API จริง) โดยใช้ base price + variation จาก date seed; cache 1 ชั่วโมง

### Pattern สำหรับ Types
ทุก feature type ใช้ pattern เดียวกัน:
```ts
export type CreateXInput = Omit<X, "id" | "createdAt" | "updatedAt">;
export type UpdateXInput = Partial<CreateXInput>;
```

## กฎการพัฒนา

### Components
- ใช้ shadcn/ui components จาก `@/components/ui` เสมอ (อย่าแก้ไขไฟล์ใน `ui/` โดยตรง)
- สร้าง feature components ใน `src/components/[feature-name]/`
- ใช้ `cn()` จาก `@/lib/utils` สำหรับ conditional className

### Data Fetching
- TanStack Query (`useQuery`, `useMutation`) สำหรับ client-side data fetching ที่ต้องการ caching
- React Server Components สำหรับ server-side data fetching
- Custom hooks ใน `src/hooks/` — ชื่อตาม feature เช่น `useCarExpenses`, `useGasPrice`

### TypeScript
- นิยาม type/interface ทุกชนิด เก็บไว้ใน `src/types/[feature].ts`
- ใช้ string dates (ISO 8601) แทน Date object

### Styling
- Tailwind CSS utility classes
- CSS variables ที่นิยามใน `globals.css` สำหรับ color scheme
- รองรับ dark mode ผ่าน `.dark` class

## Feature Modules

### Road Trip (`/road-trip`)
บันทึกการเดินทาง: ปลายทาง, วันที่, ระยะทาง, ค่าใช้จ่าย, บันทึก

### Bill Payment (`/bills`)
ติดตามค่าใช้จ่ายประจำ: ชื่อบิล, จำนวนเงิน, วันครบกำหนด, สถานะ (`pending`/`paid`/`overdue`)

### Car Service (`/car-service`)
3 tabs:
- **ประวัติซ่อมบำรุง** — placeholder (ยังไม่ได้ implement)
- **ค่าใช้จ่ายรถ** — บันทึก fuel, parking, toll ฯลฯ ผ่าน `useCarExpenses`
- **ค่าเดินทาง** — บันทึกค่าใช้จ่ายระหว่างเดินทาง ผ่าน `useTravelExpenses`

มี `GasPriceWidget` แสดงราคาน้ำมัน Shell (via `/api/gas-price`)

### Others (`/others`)
Placeholder สำหรับ feature อนาคต
