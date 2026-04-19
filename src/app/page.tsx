import Link from "next/link";
import { Car, CreditCard, Map, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Map,
    title: "Road Trip",
    description: "วางแผนและบันทึกการเดินทางของครอบครัว",
    href: "/road-trip",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    icon: CreditCard,
    title: "Bill Payment",
    description: "ติดตามและจัดการการชำระค่าใช้จ่ายต่างๆ",
    href: "/bills",
    color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  },
  {
    icon: Car,
    title: "Car Service",
    description: "บันทึกประวัติการบำรุงรักษารถยนต์",
    href: "/car-service",
    color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    icon: Settings,
    title: "อื่นๆ",
    description: "ข้อมูลอื่นๆ ของครอบครัว",
    href: "/others",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Family Hub
          </h1>
          <p className="text-muted-foreground text-lg">
            ศูนย์รวมข้อมูลสำหรับครอบครัว
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group block rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`inline-flex items-center justify-center rounded-xl p-3 mb-4 ${feature.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
