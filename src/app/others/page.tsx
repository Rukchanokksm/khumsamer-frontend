import { BackButton } from "@/components/back-button";

export default function OthersPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-6">อื่นๆ</h1>
      <p className="text-muted-foreground">ข้อมูลอื่นๆ ของครอบครัว</p>
    </main>
  );
}
