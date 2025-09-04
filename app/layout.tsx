export const metadata = {
  title: "PSX Creative Engine — MVAP Demo",
  description: "Turn-key B2B studio for memecoin launches — demo UI",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
