"use client";

import "./globals.css";
import { ReactQueryProvider } from "./react-query-provider";
import {AbstraxionProvider} from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";

// xion1f0u3lnk3nfg256ke29szf6fgswz2a02l8gq966vlkqjsrvr2zf4s5u0vhv
// xion1c32n732hzf96hqfduzkwgnq0ezxzcwusxprwm4
// xion1h4h59tzltvqueat5q00kwdgalhxg9kw597tptzzeq2fnyqv5dwhqy7mekm

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
