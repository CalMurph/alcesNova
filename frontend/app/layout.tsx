import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import localFont from "next/font/local";
import { duneFont } from "./fonts";

const chalet = localFont({
  src: "../public/fonts/Chalet1960.otf",
  variable: "--font-chalet-local",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Launch your virtual computer",
  description: "Select a model instance to connect to.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${chalet.variable} ${duneFont.variable} ${geistMono.variable} antialiased`}
    >
      <body className="h-full text-white flex flex-col">
        <div className="fixed inset-0 -z-10 " />

        <Header />

        <main className="flex-1 flex justify-center px-4 py-10 sm:px-6 bg-[#060816]">
          <div className=" mx-auto w-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
