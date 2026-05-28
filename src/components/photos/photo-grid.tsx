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

export function PhotoGrid({ photos }: { photos: MemoryPhoto[] }) {
	const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);

	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{photos.map((photo, index) => {
					const imageUrl = photo.thumbnailUrl ?? photo.url;

					return (
						<button
							className="group overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
							key={photo.id}
							onClick={() => setSelectedPhoto(photo)}
							type="button"
						>
							<div className="relative aspect-[4/5] overflow-hidden bg-secondary">
								{imageUrl ? (
									<Image
										alt={photo.title}
										className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
										fill
										sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
										src={imageUrl}
										unoptimized
									/>
								) : (
									<div
										className={`flex h-full w-full items-end bg-linear-to-br ${fallbackGradients[index % fallbackGradients.length]} p-5`}
									>
										<div className="max-w-48 text-xl font-semibold leading-tight text-white drop-shadow">
											{photo.title}
										</div>
									</div>
								)}
							</div>
							<div className="space-y-2 p-4">
								<div className="flex items-start justify-between gap-3">
									<h3 className="font-semibold">{photo.title}</h3>
									<span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
										{photo.visibility === "private" ? "私密" : "公开"}
									</span>
								</div>
								<p className="line-clamp-2 text-sm text-muted-foreground">
									{photo.description || "这张照片还在等一句说明。"}
								</p>
								<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
									<span>{formatDisplayDate(photo.takenAt)}</span>
									{photo.location ? (
										<span className="inline-flex items-center gap-1">
											<MapPin className="size-3" />
											{photo.location}
										</span>
									) : null}
								</div>
							</div>
						</button>
					);
				})}
			</div>

			{selectedPhoto ? (
				<div className="fixed inset-0 z-50 bg-[#2D2424]/75 p-4 backdrop-blur-sm">
					<div className="mx-auto flex h-full max-w-5xl flex-col justify-center">
						<div className="overflow-hidden rounded-lg bg-background shadow-2xl">
							<div className="flex items-center justify-between border-b p-4">
								<div>
									<h2 className="font-semibold">{selectedPhoto.title}</h2>
									<p className="text-sm text-muted-foreground">
										{formatDisplayDate(selectedPhoto.takenAt)}
									</p>
								</div>
								<Button
									onClick={() => setSelectedPhoto(null)}
									size="icon"
									type="button"
									variant="ghost"
								>
									<X className="size-4" />
									<span className="sr-only">关闭</span>
								</Button>
							</div>
							<div className="grid max-h-[78vh] overflow-auto md:grid-cols-[1.5fr_1fr]">
								<div className="relative min-h-80 bg-secondary">
									{selectedPhoto.url ? (
										<Image
											alt={selectedPhoto.title}
											className="h-full max-h-[78vh] w-full object-contain"
											fill
											sizes="(min-width: 768px) 60vw, 100vw"
											src={selectedPhoto.url}
											unoptimized
										/>
									) : (
										<div className="grid h-full min-h-80 place-items-center bg-linear-to-br from-[#D96C82] via-[#D7B377] to-[#8FAE9B] p-8 text-center text-3xl font-semibold text-white">
											{selectedPhoto.title}
										</div>
									)}
								</div>
								<div className="space-y-4 p-6">
									<p className="text-sm leading-7 text-muted-foreground">
										{selectedPhoto.description ||
											"照片背后的故事，之后可以在后台慢慢补上。"}
									</p>
									{selectedPhoto.location ? (
										<p className="text-sm text-muted-foreground">
											地点：{selectedPhoto.location}
										</p>
									) : null}
								</div>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
