import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: { default: "HabaClothes", template: "%s | HabaClothes" },
    description: "Refined clothing for the discerning wardrobe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>            
        </html>
    );
}