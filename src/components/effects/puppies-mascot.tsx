"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

const quotes = [
	"汪！带着相机记录每一个有你的普通日子 📸",
	"熊熊帽子很暖和，但有你在身边更暖和 🧸❤️",
	"遇见你，是所有美好的开始 🐶🐾",
	"今晚也要一起看烟花吗？✨",
];

export function PuppiesMascot() {
	const [open, setOpen] = useState(false);
	const [quoteIndex, setQuoteIndex] = useState(0);

	const handleClick = () => {
		setQuoteIndex((prev) => (prev + 1) % quotes.length);
		setOpen(true);
	};

	return (
		<div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
			{/* 对话气泡框 */}
			<AnimatePresence>
				{open && (
					<motion.div
						animate={{ opacity: 1, y: 0, scale: 1 }}
						className="relative max-w-xs rounded-xl border border-primary/30 bg-card/95 p-3.5 shadow-xl backdrop-blur-md text-xs text-foreground"
						exit={{ opacity: 0, y: 10, scale: 0.9 }}
						initial={{ opacity: 0, y: 10, scale: 0.9 }}
						transition={{ duration: 0.2 }}
					>
						<button
							aria-label="关闭提示"
							className="absolute right-2 top-2 rounded-full p-0.5 text-muted-foreground hover:bg-muted"
							onClick={() => setOpen(false)}
							type="button"
						>
							<X className="size-3.5" />
						</button>
						<div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary mb-1">
							<Heart className="size-3 fill-primary" />
							<span>小狗俩的悄悄话</span>
						</div>
						<p className="leading-relaxed text-muted-foreground">{quotes[quoteIndex]}</p>
					</motion.div>
				)}
			</AnimatePresence>

			{/* 可爱小狗挂件按钮 */}
			<motion.button
				animate={{ y: [0, -4, 0] }}
				className="group relative flex items-center justify-center rounded-full border border-primary/40 bg-card p-1 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary hover:shadow-primary/20 hover:scale-105 active:scale-95"
				onClick={handleClick}
				transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
				type="button"
			>
				<div className="relative size-12 overflow-hidden rounded-full border border-primary/20">
					<Image
						alt="戴草帽小狗与戴熊帽小狗"
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
						height={48}
						src="/puppies.jpg"
						width={48}
					/>
				</div>
				{/* 心动小红点提示 */}
				<span className="absolute -right-0.5 -top-0.5 flex size-3">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
					<span className="relative inline-flex size-3 rounded-full bg-primary" />
				</span>
			</motion.button>
		</div>
	);
}
