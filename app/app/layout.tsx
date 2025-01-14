"use client";

// import type { Metadata } from "next";
import "./globals.css";
// import AppWalletProvider from "./components/AppWalletProvider";
import { ReactQueryProvider } from "./react-query-provider";
import {AbstraxionProvider} from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";

// xion1vapzqqq6mn5qkjmlmt2uq00wzr7sar6xr0xl75ngu7ys72yu8lrstyxjd0
// xion1sqrv8xr96jjlv6647g6fq4pc7l97sxrzspvau02m98tac8la8ugsjvmve6
// xion1vdemrvdqdqkkz4clard7pv4f9pmws8pyrqalv7paud2wczrfw63q67uvwg

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
              treasury: "xion19pt4yhjl069twl5sg3lxv8qq4z46hkjx2pujf8w7q767d28czdgsk4c9xd"
            }}
          >
            {children}
          </AbstraxionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
