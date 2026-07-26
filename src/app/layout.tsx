import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FireworksOverlay } from "@/components/effects/fireworks-overlay";
import { PuppiesMascot } from "@/components/effects/puppies-mascot";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "深夜的借口",
	description: "一个收藏故事、照片、纪念日和情书的情侣纪念网站。",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
				>
					<div className="min-h-screen bg-background text-foreground">
						<SiteHeader />
						<main className="min-h-[calc(100vh-8rem)]">
							{children}
						</main>
						<SiteFooter />
						<FireworksOverlay />
						<PuppiesMascot />
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
