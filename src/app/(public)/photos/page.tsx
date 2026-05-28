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
					<h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
						照片墙
					</h1>
					<p className="text-lg leading-8 text-muted-foreground">
						公开照片会展示在这里。私密照片只会在后台和私密区域出现，不会被公开页面查询出来。
					</p>
				</div>
				<PhotoGrid photos={photos} />
			</div>
		</div>
	);
}
