"use client";

import { useState } from "react";
import { MapPin, UserCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";

import type { MemoryTimelineEvent, MemoryPhoto } from "@/lib/content";
import { formatDisplayDateTime } from "@/lib/date";

export function TimelineList({
	events,
	photos,
}: {
	events: MemoryTimelineEvent[];
	photos?: MemoryPhoto[];
}) {
	const [previewState, setPreviewState] = useState<{ photos: MemoryPhoto[]; index: number } | null>(null);

	return (
		<>
			<div className="relative flex flex-row overflow-x-auto gap-4 pb-4 sm:flex-col sm:space-y-6 sm:overflow-x-visible sm:pb-0 scroll-smooth">
				<div className="absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-px bg-border sm:block" />
				{events.map((event, index) => (
					<article className="relative w-[300px] shrink-0 pl-0 sm:w-auto sm:shrink sm:pl-12" key={event.id}>
						{/* 移动端横排拼接时间轴线及小圆点 */}
						<div className="relative flex items-center justify-center h-8 mb-2 sm:hidden">
							{/* 左半段线：第一张卡片不显示 */}
							{index > 0 && <div className="absolute left-0 right-1/2 top-1/2 h-px bg-border" />}
							{/* 右半段线：最后一张卡片不显示 */}
							{index < events.length - 1 && <div className="absolute left-1/2 right-0 top-1/2 h-px bg-border" />}
							{/* 圆心 */}
							<div className="z-10 grid size-6 place-items-center rounded-full border bg-background">
								<div className="size-2 rounded-full bg-primary" />
							</div>
						</div>

						{/* 桌面端直立时间轴圆点：仅在桌端显示 */}
						<div className="absolute left-0 top-1 hidden size-8 place-items-center rounded-full border bg-background sm:grid">
							<div className="size-2 rounded-full bg-primary" />
						</div>

						<div className="rounded-lg border bg-card p-5 shadow-sm">
							<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
								{event.location ? (
									<span className="inline-flex items-center gap-1">
										<MapPin className="size-3" />
										{event.location}
									</span>
								) : null}
								<span className="rounded-full bg-secondary px-2 py-0.5">
									{event.visibility === "private" ? "私密" : "公开"}
								</span>
								<span className="text-muted-foreground/60">记录于 {formatDisplayDateTime(event.createdAt)}</span>
							</div>
							<h3 className="mt-3 text-lg font-semibold">{event.title}</h3>
							{event.description ? (
								<p className="mt-2 text-sm leading-6 text-muted-foreground whitespace-pre-line">
									{event.description}
								</p>
							) : null}

							{/* 关联的主题相册缩略图列表 */}
							{photos && event.photoId && (() => {
								const albumPhotos = photos.filter((p) => p.title === event.photoId);
								if (albumPhotos.length === 0) return null;
								return (
									<div className="mt-4 space-y-2 border-t pt-3">
										<p className="text-xs font-semibold text-primary flex items-center gap-1.5">
											<span>关联相册：{event.photoId}</span>
											<span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-normal text-[10px]">
												{albumPhotos.length} 张照片
											</span>
										</p>
										<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
											{albumPhotos.map((photo, pIdx) => (
												<button
													key={photo.id}
													className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted transition hover:opacity-90 active:scale-[0.96]"
													onClick={() => setPreviewState({ photos: albumPhotos, index: pIdx })}
													type="button"
												>
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														alt={photo.title}
														className="h-full w-full object-cover"
														src={photo.thumbnailUrl ?? photo.url ?? ""}
													/>
												</button>
											))}
										</div>
									</div>
								);
							})()}

							{event.createdBy ? (
								<p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-2">
									<UserCircle2 className="size-3" />
									由 {event.createdBy} 记录
								</p>
							) : null}
						</div>
					</article>
				))}
			</div>

			{/* 大图放大预览 Modal */}
			{previewState && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
					onClick={(e) => { if (e.target === e.currentTarget) setPreviewState(null); }}
				>
					<button
						className="absolute right-4 top-4 text-white hover:text-white/80 z-50"
						onClick={() => setPreviewState(null)}
						type="button"
					>
						<X className="size-6" />
					</button>

					{/* 左右切换 */}
					<div className="relative flex items-center justify-center w-full max-w-4xl max-h-[80vh]">
						{previewState.photos.length > 1 && (
							<>
								<button
									className="absolute left-2 z-10 grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition active:scale-95"
									onClick={() => setPreviewState({
										...previewState,
										index: (previewState.index - 1 + previewState.photos.length) % previewState.photos.length
									})}
									type="button"
								>
									<ChevronLeft className="size-6" />
								</button>
								<button
									className="absolute right-2 z-10 grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition active:scale-95"
									onClick={() => setPreviewState({
										...previewState,
										index: (previewState.index + 1) % previewState.photos.length
									})}
									type="button"
								>
									<ChevronRight className="size-6" />
								</button>
							</>
						)}

						{/* 大图 */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							alt={previewState.photos[previewState.index].title}
							className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg select-none"
							src={previewState.photos[previewState.index].url ?? ""}
						/>
					</div>

					{/* 描述信息 */}
					<div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white space-y-1 bg-black/45 px-4 py-2 rounded-xl backdrop-blur-md">
						<p className="text-sm font-medium">{previewState.photos[previewState.index].title}</p>
						{previewState.photos[previewState.index].description && (
							<p className="text-xs text-white/70 max-w-[280px] sm:max-w-md line-clamp-2">{previewState.photos[previewState.index].description}</p>
						)}
						<p className="text-xs text-white/50">{previewState.index + 1} / {previewState.photos.length}</p>
					</div>
				</div>
			)}
		</>
	);
}
