import React from 'react';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'VedaAI - AI Assessment & Question Paper Creator',
  description: 'AI platform for teachers to generate and manage school assessment question papers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="font-sans bg-neutral-50 min-h-screen text-neutral-600">
        {children}
      </body>
    </html>
  );
}
