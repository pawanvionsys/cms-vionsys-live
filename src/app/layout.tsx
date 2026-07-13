import type { Metadata } from 'next';
import { Outfit, Manrope } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Vionsys CMS Platform',
  description: 'Premium no-code publishing tools for Vionsys blogs and case studies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50/30 flex flex-col text-slate-800">
        {children}
      </body>
    </html>
  );
}
