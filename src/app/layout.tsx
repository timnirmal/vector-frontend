import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import localFont from 'next/font/local';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const spaceGrotesk = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

const Alliance = localFont({
  src: '../fonts/AllianceNo2.woff2',
  variable: '--font-Alli',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
     <body className={`${spaceGrotesk.className} ${Alliance.variable} bg-[#dde6e5]`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}