import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
	getAdminAnniversaries,
	getAllLetters,
	getAllPhotos,
	getAllTimelineEvents,
	getSiteSettings,
} from "@/lib/content";

export default async function AdminPage() {
	const [settings, photos, letters, timeline, anniversaries] = await Promise.all([
		getSiteSettings(),
		getAllPhotos(),
		getAllLetters(),
		getAllTimelineEvents(),
		getAdminAnniversaries(),
	]);

	return (
		<div className="memory-section">
			<div className="memory-shell">
				<AdminDashboard
					anniversaries={anniversaries}
					letters={letters}
					photos={photos}
					settings={settings}
					timeline={timeline}
				/>
			</div>
		</div>
	);
}
