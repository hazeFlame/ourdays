"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";

import type { MemoryPhoto } from "@/lib/content";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date";
import { Button } from "@/components/ui/button";

const fallbackGradients = [
	"from-[#EFECE6] to-[#D9D4C7]",
	"from-[#EAE6DF] via-[#DFDCD5] to-[#C8C2B7]",
	"from-[#F2EDE4] to-[#E3D9C8]",
	"from-[#EAEAEA] to-[#CCCCCC]",
];

type PhotoGroup = {
	title: string;
	photos: MemoryPhoto[];
};

function groupPhotosByTitle(photos: MemoryPhoto[]): PhotoGroup[] {
	const map = new Map<string, MemoryPhoto[]>();
	for (const photo of photos) {
		const key = photo.title;
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(photo);
	}
	return Array.from(map.entries()).map(([title, photos]) => ({ title, photos }));
}

function PhotoTile({
	photo,
	fallbackIndex,
}: {
	photo: MemoryPhoto;
	fallbackIndex: number;
}) {
	const url = photo.thumbnailUrl ?? photo.url;
	if (url) {
		return (
			<Image
				alt={photo.title}
				className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
				fill
				sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
				src={url}
				unoptimized
			/>
		);
	}
	return (
		<div
			className={`h-full w-full bg-linear-to-br ${fallbackGradients[fallbackIndex % fallbackGradients.length]}`}
		/>
	);
}

function AlbumCover({
	group,
	fallbackIndex,
}: {
	group: PhotoGroup;
	fallbackIndex: number;
}) {
	const { photos } = group;
	const count = photos.length;

	if (count === 1) {
		return (
			<div className="relative aspect-[4/5] overflow-hidden bg-secondary">
				<PhotoTile fallbackIndex={fallbackIndex} photo={photos[0]} />
			</div>
		);
	}

	if (count === 2) {
		return (
			<div className="relative aspect-[4/5] grid grid-cols-2 gap-0.5 overflow-hidden bg-border/40">
				{photos.slice(0, 2).map((p, i) => (
					<div className="relative overflow-hidden bg-secondary" key={p.id}>
						<PhotoTile fallbackIndex={fallbackIndex + i} photo={p} />
					</div>
				))}
			</div>
		);
	}

	if (count === 3) {
		return (
			<div className="relative aspect-[4/5] grid grid-cols-2 gap-0.5 overflow-hidden bg-border/40">
				<div className="relative row-span-2 overflow-hidden bg-secondary">
					<PhotoTile fallbackIndex={fallbackIndex} photo={photos[0]} />
				</div>
				<div className="relative overflow-hidden bg-secondary">
					<PhotoTile fallbackIndex={fallbackIndex + 1} photo={photos[1]} />
				</div>
				<div className="relative overflow-hidden bg-secondary">
					<PhotoTile fallbackIndex={fallbackIndex + 2} photo={photos[2]} />
				</div>
			</div>
		);
	}

	// 4+: 2×2 grid
	const tiles = photos.slice(0, 4);
	const extra = count - 4;
	return (
		<div className="relative aspect-[4/5] grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden bg-border/40">
			{tiles.map((p, i) => (
				<div className="relative overflow-hidden bg-secondary" key={p.id}>
					<PhotoTile fallbackIndex={fallbackIndex + i} photo={p} />
					{i === 3 && extra > 0 && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/60 text-base font-semibold text-white">
							+{extra}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

export function PhotoGrid({
	photos,
	maxGroups,
}: {
	photos: MemoryPhoto[];
	maxGroups?: number;
}) {
	const [selectedGroup, setSelectedGroup] = useState<PhotoGroup | null>(null);
	const [photoIndex, setPhotoIndex] = useState(0);

	const groups = groupPhotosByTitle(photos);
	const visibleGroups = maxGroups ? groups.slice(0, maxGroups) : groups;

	const openGroup = (group: PhotoGroup) => {
		setSelectedGroup(group);
		setPhotoIndex(0);
	};

	const closeGroup = () => {
		setSelectedGroup(null);
		setPhotoIndex(0);
	};

	const prev = () =>
		setPhotoIndex((i) => (i - 1 + selectedGroup!.photos.length) % selectedGroup!.photos.length);
	const next = () =>
		setPhotoIndex((i) => (i + 1) % selectedGroup!.photos.length);

	return (
		<>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{visibleGroups.map((group, index) => {
					const cover = group.photos[0];
					return (
						<button
							className="group overflow-hidden rounded-md border border-border/60 bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_15px_30px_-15px_rgba(0,0,0,0.08)]"
							key={group.title}
							onClick={() => openGroup(group)}
							type="button"
						>
							<AlbumCover fallbackIndex={index} group={group} />
							<div className="space-y-2.5 p-5">
								<div className="flex items-center justify-between gap-3">
									<h3 className="font-semibold text-sm tracking-tight text-foreground">{group.title}</h3>
									<span className="shrink-0 rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] tracking-wider font-semibold text-muted-foreground uppercase">
										{cover.visibility === "private" ? "私密" : "公开"}
									</span>
								</div>
								<p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
									{cover.description || "这个相册还在等一句说明。"}
								</p>
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-wide text-muted-foreground/60 border-t border-border/30 pt-3">
									{cover.location ? (
										<span className="inline-flex items-center gap-1">
											<MapPin className="size-3 text-primary/80" />
											{cover.location}
										</span>
									) : null}
									<span>{formatDisplayDate(cover.createdAt)}</span>
								</div>
							</div>
						</button>
					);
				})}
			</div>

			{selectedGroup ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
					onClick={(e) => { if (e.target === e.currentTarget) closeGroup(); }}
				>
					<div className="flex h-full max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-md bg-background shadow-2xl border border-border/40">
						{/* Header */}
						<div className="flex shrink-0 items-center justify-between border-b border-border/40 px-5 py-4">
							<div className="space-y-0.5">
								<h2 className="font-semibold tracking-tight text-foreground text-sm">{selectedGroup.title}</h2>
								<p className="text-[10px] tracking-widest text-muted-foreground font-medium uppercase">
									{photoIndex + 1} / {selectedGroup.photos.length} PHOTOS
								</p>
							</div>
							<Button onClick={closeGroup} size="icon" type="button" variant="ghost" className="rounded-md size-7">
								<X className="size-4" />
								<span className="sr-only">关闭</span>
							</Button>
						</div>

						{/* Thumbnail strip (top) */}
						{selectedGroup.photos.length > 1 && (
							<div className="flex shrink-0 gap-2 overflow-x-auto border-b px-3 py-2">
								{selectedGroup.photos.map((p, i) => {
									const thumbUrl = p.thumbnailUrl ?? p.url;
									return (
										<button
											className={`relative size-14 shrink-0 overflow-hidden rounded-md border-2 transition ${
												i === photoIndex
													? "border-primary"
													: "border-transparent opacity-50 hover:opacity-80"
											}`}
											key={p.id}
											onClick={() => setPhotoIndex(i)}
											type="button"
										>
											{thumbUrl ? (
												<Image
													alt={p.title}
													className="h-full w-full object-cover"
													fill
													sizes="56px"
													src={thumbUrl}
													unoptimized
												/>
											) : (
												<div className="h-full w-full bg-muted" />
											)}
										</button>
									);
								})}
							</div>
						)}

						{/* Large image (middle, fills remaining space) */}
						<div className="relative min-h-0 flex-1 bg-black">
							{selectedGroup.photos[photoIndex].url ? (
								<Image
									alt={selectedGroup.photos[photoIndex].title}
									className="h-full w-full object-contain"
									fill
									sizes="(min-width: 768px) 768px, 100vw"
									src={selectedGroup.photos[photoIndex].url!}
									unoptimized
								/>
							) : (
								<div className="grid h-full place-items-center bg-linear-to-br from-[#D96C82] via-[#D7B377] to-[#8FAE9B] text-3xl font-semibold text-white">
									{selectedGroup.title}
								</div>
							)}

							{/* Prev / Next */}
							{selectedGroup.photos.length > 1 && (
								<>
									<button
										className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/75"
										onClick={prev}
										type="button"
									>
										<ChevronLeft className="size-5" />
									</button>
									<button
										className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/75"
										onClick={next}
										type="button"
									>
										<ChevronRight className="size-5" />
									</button>
								</>
							)}
						</div>

						{/* Info footer */}
						<div className="shrink-0 border-t px-4 py-3">
							{selectedGroup.photos[photoIndex].description ? (
								<p className="mb-2 text-sm text-muted-foreground">
									{selectedGroup.photos[photoIndex].description}
								</p>
							) : null}
							<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
								{selectedGroup.photos[photoIndex].location ? (
									<span className="inline-flex items-center gap-1">
										<MapPin className="size-3" />
										{selectedGroup.photos[photoIndex].location}
									</span>
								) : null}
								<span className="text-muted-foreground/60">
									记录于 {formatDisplayDateTime(selectedGroup.photos[photoIndex].createdAt)}
								</span>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
