import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import pkg from "../../package.json";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Hub",
  description: "แอปพลิเคชันจัดการข้อมูลครอบครัว",
};

// รัน inline ก่อน hydration เพื่อเซ็ต class dark ทันที ลด flash
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('family-hub-theme');
    var theme = stored || 'system';
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
          <div className="fixed bottom-3 left-4 text-xs text-muted-foreground/40 select-none pointer-events-none">
            v{pkg.version}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
