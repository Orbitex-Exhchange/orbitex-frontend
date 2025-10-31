import { AuthGuard } from '@/components/auth/AuthGuard';

export default function TradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}

