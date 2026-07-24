"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Fireworks } from "fireworks-js";

export function FireworksOverlay() {
	const [active, setActive] = useState(true);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const fireworksRef = useRef<Fireworks | null>(null);

	useEffect(() => {
		if (!active || !containerRef.current) {
			if (fireworksRef.current) {
				fireworksRef.current.stop();
				fireworksRef.current = null;
			}
			return;
		}

		const fireworks = new Fireworks(containerRef.current, {
			autoresize: true,
			opacity: 0.85,
			acceleration: 1.05,
			friction: 0.97,
			gravity: 1.6,
			particles: 90,
			explosion: 7,
			intensity: 28,
			flickering: 50,
			lineStyle: "round",
			hue: { min: 320, max: 20 }, // 深夜诱惑玫瑰与金红系
			delay: { min: 30, max: 60 },
			brightness: { min: 55, max: 85 },
			decay: { min: 0.015, max: 0.03 },
			mouse: {
				click: false, // 禁用内部独占点击，使用外部无感绑定
				move: false,
				max: 1,
			},
		});

		fireworks.start();
		fireworksRef.current = fireworks;

		// 监听全局点击：既不影响网页按钮/链接正常点击，又能触发烟花绽放
		const handleGlobalClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (target?.closest?.("#fireworks-toggle-btn")) return;
			if (fireworksRef.current) {
				fireworksRef.current.launch(1);
			}
		};

		window.addEventListener("click", handleGlobalClick);

		return () => {
			window.removeEventListener("click", handleGlobalClick);
			fireworks.stop();
			fireworksRef.current = null;
		};
	}, [active]);

	return (
		<>
			{/* 浮动烟花控制按钮 */}
			<button
				id="fireworks-toggle-btn"
				aria-label={active ? "关闭烟花" : "开启烟花"}
				className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-300 ${
					active
						? "border-primary bg-primary text-primary-foreground shadow-primary/30 scale-105"
						: "border-border/60 bg-background/80 text-foreground hover:border-primary/50 hover:bg-card hover:scale-105"
				}`}
				onClick={() => setActive((prev) => !prev)}
				type="button"
			>
				{active ? (
					<>
						<X className="size-4" />
						<span>关闭烟花</span>
					</>
				) : (
					<>
						<Sparkles className="size-4 text-primary animate-pulse" />
						<span>放烟花 🎆</span>
					</>
				)}
			</button>

			{/* 烟花 Canvas 容器层 (设置为 pointer-events-none 彻底解除页面遮挡) */}
			{active && (
				<div
					className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
					ref={containerRef}
				/>
			)}
		</>
	);
}
