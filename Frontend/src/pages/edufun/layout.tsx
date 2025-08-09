import React from "react";
import "./globals.css";

export const metadata = {
  title: "EduFun Sandbox - Learn Hedera Network",
  description:
    "Interactive learning platform for Hedera Network development with hands-on tutorials and AI assistance.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
