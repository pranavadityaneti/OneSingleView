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
    console.log("Rendering RootLayout");
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${redHatDisplay.variable} font-sans`} suppressHydrationWarning>{children}</body>
        </html>
    );
}
