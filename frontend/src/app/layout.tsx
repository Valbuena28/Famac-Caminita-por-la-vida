import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SGP-FAMAC | Sistema de Gestión de Pacientes',
  description: 'Sistema de Gestión de Pacientes Oncológicos - FAMAC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
