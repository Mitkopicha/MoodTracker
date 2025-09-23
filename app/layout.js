// app/layout.js
import "./globals.css";
import { geistSans } from "./fonts";
import AuthProvider from "../components/AuthProvider";
import AutoSyncBootstrap from "../components/AutoSyncBootstrap";
import ClientGate from "../components/ClientGate";
import NavbarGate from "../components/NavbarGate";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "MoodTrack",
  description: "Local-first mood & habit tracker with optional sync",
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // enables safe-area insets on iPhone
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
  {/* navbar lives full width */}
  <AuthProvider>
    <NavbarGate />
    <AutoSyncBootstrap />
    <ClientGate>{children}</ClientGate>
  </AuthProvider>
</body>

    </html>
  );
}
