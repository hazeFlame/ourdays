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
						相册
					</h1>
				</div>
				<PhotoGrid photos={photos} />
			</div>
		</div>
	);
}
