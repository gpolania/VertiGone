// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import BootstrapClient from "@/components/BootstrapClient"; // cliente solo para JS de Bootstrap

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VertiGone",
  description: "Aplicación para la terapia de reposicionamiento del vértigo",
};

export default function RootLayout({
  children}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-white text-dark antialiased">
        {/* Bootstrap JS loader */}
        <BootstrapClient />

        

        {/* MAIN */}
        <main className="container pt-5 mt-5 mb-5">{children}</main>

        
      </body>
    </html>
  );
}
