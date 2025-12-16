import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";

const redHatDisplay = Red_Hat_Display({
    subsets: ["latin"],
    variable: "--font-red-hat-display",
});

export const metadata: Metadata = {
    title: "One Single View | Insurance Policy Management",
    description: "Comprehensive insurance policy management and analytics dashboard for corporate and individual customers",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no" />
            </head>
            <body className={`${redHatDisplay.variable} font-sans pb-16 md:pb-0`} suppressHydrationWarning>
                {children}
                <MobileNavWrapper />
            </body>
        </html>
    );
}

// Separate wrapper to avoid 'use client' in Layout
import MobileNavWrapper from "../components/layout/MobileNavWrapper";
