"use client";

import "./globals.css";
import { ReactQueryProvider } from "./react-query-provider";
import {AbstraxionProvider} from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <AbstraxionProvider config={{
              treasury: "xion1v4n3tfl5yx0y5tuhl07nfp8nvmaydq0tdwth0zz2v34rgx86khzqry42m9"
            }}
          >
            {children}
          </AbstraxionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
