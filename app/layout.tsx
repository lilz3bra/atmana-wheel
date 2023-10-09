import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import AuthProvider from "./AuthProvider";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <html lang="en">
                <body className={inter.className}>
                    <Navbar />
                    {children}
                </body>
            </html>
        </AuthProvider>
    );
}
