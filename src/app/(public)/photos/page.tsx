import { PhotoGrid } from "@/components/photos/photo-grid";
import { getPublicPhotos } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
	const photos = await getPublicPhotos();

	return (
		<div className="memory-section">
			<div className="memory-shell space-y-8">
				<div className="max-w-2xl space-y-4">
					<p className="memory-kicker">Photos</p>
					<h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
						相册
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground/90 max-w-sm">
						用照片定格的每一个瞬间，都是我们漫长岁月里最珍贵的收藏。
					</p>
				</div>
				<PhotoGrid photos={photos} />
			</div>
		</div>
	);
}
