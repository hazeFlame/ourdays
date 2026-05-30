"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, X } from "lucide-react";

import type { MemoryPhoto } from "@/lib/content";
import { formatDisplayDate } from "@/lib/date";
import { Button } from "@/components/ui/button";

const fallbackGradients = [
	"from-[#D96C82] via-[#E8B5A8] to-[#FFF0D8]",
	"from-[#8FAE9B] via-[#D8C79A] to-[#FFF9F4]",
	"from-[#D7B377] via-[#F1D4C3] to-[#D96C82]",
	"from-[#B98B82] via-[#8FAE9B] to-[#F7EEE8]",
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
				className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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
			<div className="relative aspect-[4/5] grid grid-cols-2 gap-0.5 overflow-hidden bg-border">
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
			<div className="relative aspect-[4/5] grid grid-cols-2 gap-0.5 overflow-hidden bg-border">
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

	// 4+: 2×2 grid, show extra count overlay on last cell
	const tiles = photos.slice(0, 4);
	const extra = count - 4;
	return (
		<div className="relative aspect-[4/5] grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden bg-border">
			{tiles.map((p, i) => (
				<div className="relative overflow-hidden bg-secondary" key={p.id}>
					<PhotoTile fallbackIndex={fallbackIndex + i} photo={p} />
					{i === 3 && extra > 0 && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
							+{extra}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

export function PhotoGrid({ photos }: { photos: MemoryPhoto[] }) {
	const [selectedGroup, setSelectedGroup] = useState<PhotoGroup | null>(null);

	const groups = groupPhotosByTitle(photos);

	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{groups.map((group, index) => {
					const cover = group.photos[0];

					return (
						<button
							className="group overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
							key={group.title}
							onClick={() => setSelectedGroup(group)}
							type="button"
						>
							<AlbumCover fallbackIndex={index} group={group} />

							<div className="space-y-2 p-4">
								<div className="flex items-start justify-between gap-3">
									<h3 className="font-semibold">{group.title}</h3>
									<span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
										{cover.visibility === "private" ? "私密" : "公开"}
									</span>
								</div>
								<p className="line-clamp-2 text-sm text-muted-foreground">
									{cover.description || "这个相册还在等一句说明。"}
								</p>
								<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
									<span>{formatDisplayDate(cover.takenAt)}</span>
									{cover.location ? (
										<span className="inline-flex items-center gap-1">
											<MapPin className="size-3" />
											{cover.location}
										</span>
									) : null}
									<span className="text-muted-foreground/60">记录于 {formatDisplayDate(cover.createdAt)}</span>
								</div>
							</div>
						</button>
					);
				})}
			</div>

			{selectedGroup ? (
				<div
					className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2424]/75 p-4 backdrop-blur-sm"
					onClick={(e) => {
						if (e.target === e.currentTarget) setSelectedGroup(null);
					}}
				>
					<div className="mx-auto my-8 max-w-4xl rounded-lg bg-background shadow-2xl">
						{/* Header */}
						<div className="flex items-center justify-between border-b p-4">
							<div>
								<h2 className="font-semibold">{selectedGroup.title}</h2>
								<p className="text-sm text-muted-foreground">
									共 {selectedGroup.photos.length} 张
								</p>
							</div>
							<Button
								onClick={() => setSelectedGroup(null)}
								size="icon"
								type="button"
								variant="ghost"
							>
								<X className="size-4" />
								<span className="sr-only">关闭</span>
							</Button>
						</div>

						{/* 描述 */}
						{selectedGroup.photos[0].description ? (
							<p className="px-5 pt-4 text-sm leading-7 text-muted-foreground">
								{selectedGroup.photos[0].description}
							</p>
						) : null}

						{/* 全部照片网格 */}
						<div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
							{selectedGroup.photos.map((photo) => {
								const url = photo.url ?? photo.thumbnailUrl;
								return (
									<div
										className="relative aspect-square overflow-hidden rounded-lg bg-secondary"
										key={photo.id}
									>
										{url ? (
											<Image
												alt={photo.title}
												className="h-full w-full object-cover"
												fill
												sizes="(min-width: 640px) 33vw, 50vw"
												src={url}
												unoptimized
											/>
										) : (
											<div className="h-full w-full bg-muted" />
										)}
									</div>
								);
							})}
						</div>

						{/* 底部元信息 */}
						<div className="flex flex-wrap items-center gap-3 border-t px-5 py-3 text-xs text-muted-foreground">
							<span>{formatDisplayDate(selectedGroup.photos[0].takenAt)}</span>
							{selectedGroup.photos[0].location ? (
								<span className="inline-flex items-center gap-1">
									<MapPin className="size-3" />
									{selectedGroup.photos[0].location}
								</span>
							) : null}
							<span className="text-muted-foreground/60">记录于 {formatDisplayDate(selectedGroup.photos[0].createdAt)}</span>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
