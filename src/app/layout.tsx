import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Edify — The World's Living Sky of Ideas",
  description:
    "Share, enlighten, and support humanity's most important thoughts. Ideas float as luminous clouds in a serene sunset sky, supported by micro-antes from people worldwide.",
  keywords: [
    "edify",
    "ideas",
    "statements",
    "opinions",
    "world events",
    "micro-payments",
    "community",
    "global platform",
  ],
  openGraph: {
    title: "Edify — The World's Living Sky of Ideas",
    description:
      "Fly through a serene sunset sky of humanity's thoughts. Support ideas with micro-antes.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#120E21",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#1A162B] text-[#FFFDF9] overflow-hidden">
        {children}
      </body>
    </html>
  );
}
