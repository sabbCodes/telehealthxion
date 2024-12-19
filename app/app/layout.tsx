"use client";

// import type { Metadata } from "next";
import "./globals.css";
import AppWalletProvider from "./components/AppWalletProvider";
import { ReactQueryProvider } from "./react-query-provider";
import {AbstraxionProvider} from "@burnt-labs/abstraxion";
// import TREASURY from "@/constants";
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";

// export const metadata: Metadata = {
//   title: "teleHealthSol",
//   description: "Telemedicine app, built with love from Nigeria.",
//   openGraph: {
//     title: "teleHealthSol - Telemedicine App",
//     description: "Telemedicine app, built with love from Nigeria.",
//     url: "https://telehealthsol.health",
//     siteName: "teleHealthSol",
//     images: [
//       {
//         url: "https://telehealthsol.health/teleHealth.jpg",
//         width: 800,
//         height: 600,
//         alt: "teleHealthSol logo",
//       },
//     ],
//     locale: "en_US",
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "teleHealthSol",
//     description: "Telemedicine app, built with love from Nigeria.",
//     images: ["https://telehealthsol.health/teleHealth.jpg"],
//     site: "@teleHealthS0l",
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <AbstraxionProvider config={{ treasury: "xion1vapzqqq6mn5qkjmlmt2uq00wzr7sar6xr0xl75ngu7ys72yu8lrstyxjd0" }} >
            {children}
          </AbstraxionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
