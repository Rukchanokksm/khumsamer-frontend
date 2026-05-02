import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,  // 15 minutes — ข้อมูลถือว่า fresh 15 นาที
      gcTime: 1000 * 60 * 30,     // 30 minutes — เก็บ cache ไว้ 30 นาทีหลัง unmount
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
