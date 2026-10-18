import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import RegisterSW from "@/components/RegisterSW";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Pastely – Instant clipboard sync",
  description:
    "Send text, photos and documents between your iPhone and Windows PC in real time. Everything self-destructs after 5 minutes.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Pastely", statusBarStyle: "default" },
  icons: { icon: "/icon.svg" },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
