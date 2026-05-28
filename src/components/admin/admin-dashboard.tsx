"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
	CalendarHeart,
	ImagePlus,
	LayoutDashboard,
	Loader2,
	PenLine,
	Plus,
	Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	createAnniversary,
	createLetter,
	createPhoto,
	createTimelineEvent,
	deleteAnniversary,
	deleteLetter,
	deletePhoto,
	deleteTimelineEvent,
	updateAnniversary,
	updateLetter,
	updatePhoto,
	updateSettings,
	updateTimelineEvent,
} from "@/lib/actions/content";
import type {
	MemoryAnniversary,
	MemoryLetter,
	MemoryPhoto,
	MemoryTimelineEvent,
	SiteSettings,
} from "@/lib/content";
import { toDateInputValue } from "@/lib/date";

type AdminDashboardProps = {
	anniversaries: MemoryAnniversary[];
	letters: MemoryLetter[];
	photos: MemoryPhoto[];
	settings: SiteSettings;
	timeline: MemoryTimelineEvent[];
};

type ActionResult = {
	error?: string;
	ok?: boolean;
};

function getString(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

function getFile(formData: FormData, key: string) {
	const value = formData.get(key);
	return value instanceof File && value.size > 0 ? value : null;
}

function Field({
	children,
	label,
}: {
	children: React.ReactNode;
	label: string;
}) {
	return (
		<label className="space-y-2 text-sm font-medium">
			<span>{label}</span>
			{children}
		</label>
	);
}

const inputClass =
	"h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40";
const textareaClass =
	"min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40";
const selectClass =
	"h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40";

export function AdminDashboard({
	anniversaries,
	letters,
	photos,
	settings,
	timeline,
}: AdminDashboardProps) {
	const router = useRouter();
	const [message, setMessage] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const runAction = async (
		action: Promise<ActionResult>,
		successMessage: string,
		form?: HTMLFormElement
	) => {
		setIsPending(true);
		setMessage(null);
		const result = await action;
		setIsPending(false);

		if (result.error) {
			setMessage(result.error);
			return;
		}

		form?.reset();
		setMessage(successMessage);
		router.refresh();
	};

	const uploadFile = async (file: File, kind: "photo" | "private") => {
		const body = new FormData();
		body.set("file", file);
		body.set("kind", kind);

		const response = await fetch("/api/uploads", {
			body,
			method: "POST",
		});
		const payload = (await response.json()) as {
			error?: string;
			url?: string;
		};

		if (!response.ok) {
			throw new Error(payload.error || "图片上传失败。");
		}

		if (!payload.url) {
			throw new Error("上传结果缺少图片地址。");
		}

		return payload.url;
	};

	const submitPhoto = async (
		event: FormEvent<HTMLFormElement>,
		id?: string
	) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const visibility = getString(formData, "visibility") || "public";
		const file = getFile(formData, "image");
		let imageUrl = "";

		try {
			if (file) {
				imageUrl = await uploadFile(
					file,
					visibility === "private" ? "private" : "photo"
				);
			}
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "图片上传失败。");
			return;
		}

		const input = {
			description: getString(formData, "description"),
			imageUrl,
			location: getString(formData, "location"),
			sortOrder: getString(formData, "sortOrder"),
			takenAt: getString(formData, "takenAt"),
			title: getString(formData, "title"),
			visibility,
		};

		await runAction(
			id ? updatePhoto(id, input) : createPhoto(input),
			id ? "照片已更新。" : "照片已添加。",
			id ? undefined : form
		);
	};

	const submitSettings = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		await runAction(
			updateSettings({
				coupleNames: getString(formData, "coupleNames"),
				heroImageUrl: getString(formData, "heroImageUrl"),
				heroSubtitle: getString(formData, "heroSubtitle"),
				heroTitle: getString(formData, "heroTitle"),
				loveStartDate: getString(formData, "loveStartDate"),
				siteTitle: getString(formData, "siteTitle"),
			}),
			"站点设置已更新。"
		);
	};

	const submitLetter = async (
		event: FormEvent<HTMLFormElement>,
		id?: string
	) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const input = {
			author: getString(formData, "author"),
			content: getString(formData, "content"),
			title: getString(formData, "title"),
			visibility: getString(formData, "visibility"),
			writtenAt: getString(formData, "writtenAt"),
		};

		await runAction(
			id ? updateLetter(id, input) : createLetter(input),
			id ? "情书已更新。" : "情书已添加。",
			id ? undefined : form
		);
	};

	const submitTimeline = async (
		event: FormEvent<HTMLFormElement>,
		id?: string
	) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const input = {
			description: getString(formData, "description"),
			eventDate: getString(formData, "eventDate"),
			location: getString(formData, "location"),
			photoId: getString(formData, "photoId"),
			title: getString(formData, "title"),
			visibility: getString(formData, "visibility"),
		};

		await runAction(
			id ? updateTimelineEvent(id, input) : createTimelineEvent(input),
			id ? "时间线已更新。" : "时间线已添加。",
			id ? undefined : form
		);
	};

	const submitAnniversary = async (
		event: FormEvent<HTMLFormElement>,
		id?: string
	) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const input = {
			date: getString(formData, "date"),
			description: getString(formData, "description"),
			isPrimary: formData.get("isPrimary") === "on",
			title: getString(formData, "title"),
			type: getString(formData, "type") || "annual",
		};

		await runAction(
			id ? updateAnniversary(id, input) : createAnniversary(input),
			id ? "纪念日已更新。" : "纪念日已添加。",
			id ? undefined : form
		);
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="memory-kicker">Admin</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-normal">
						后台编辑入口
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						上传照片、编辑情书、维护时间线和纪念日。
					</p>
				</div>
				{isPending ? (
					<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						保存中
					</div>
				) : null}
			</div>

			{message ? (
				<p className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
					{message}
				</p>
			) : null}

			<section className="rounded-lg border bg-card p-5 shadow-sm">
				<h2 className="flex items-center gap-2 text-xl font-semibold">
					<LayoutDashboard className="size-5 text-primary" />
					站点设置
				</h2>
				<form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={submitSettings}>
					<Field label="站点标题">
						<input className={inputClass} defaultValue={settings.siteTitle} name="siteTitle" />
					</Field>
					<Field label="两个人的名字">
						<input className={inputClass} defaultValue={settings.coupleNames} name="coupleNames" />
					</Field>
					<Field label="Hero 标题">
						<input className={inputClass} defaultValue={settings.heroTitle} name="heroTitle" />
					</Field>
					<Field label="恋爱开始日期">
						<input className={inputClass} defaultValue={settings.loveStartDate} name="loveStartDate" type="date" />
					</Field>
					<Field label="Hero 副标题">
						<textarea className={textareaClass} defaultValue={settings.heroSubtitle} name="heroSubtitle" />
					</Field>
					<Field label="Hero 图片 URL">
						<textarea className={textareaClass} defaultValue={settings.heroImageUrl ?? ""} name="heroImageUrl" />
					</Field>
					<div className="md:col-span-2">
						<Button disabled={isPending} type="submit">
							保存设置
						</Button>
					</div>
				</form>
			</section>

			<section className="rounded-lg border bg-card p-5 shadow-sm">
				<h2 className="flex items-center gap-2 text-xl font-semibold">
					<ImagePlus className="size-5 text-primary" />
					照片上传
				</h2>
				<form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(event) => submitPhoto(event)}>
					<Field label="标题">
						<input className={inputClass} name="title" required />
					</Field>
					<Field label="照片">
						<input accept="image/*" className={inputClass} name="image" required type="file" />
					</Field>
					<Field label="日期">
						<input className={inputClass} name="takenAt" type="date" />
					</Field>
					<Field label="地点">
						<input className={inputClass} name="location" />
					</Field>
					<Field label="可见性">
						<select className={selectClass} name="visibility">
							<option value="public">公开展示</option>
							<option value="private">私密</option>
						</select>
					</Field>
					<Field label="排序权重">
						<input className={inputClass} defaultValue="0" name="sortOrder" type="number" />
					</Field>
					<Field label="说明">
						<textarea className={textareaClass} name="description" />
					</Field>
					<div className="flex items-end">
						<Button disabled={isPending} type="submit">
							<Plus className="size-4" />
							添加照片
						</Button>
					</div>
				</form>
			</section>

			<EditablePhotos isPending={isPending} onDelete={runAction} onSubmit={submitPhoto} photos={photos} />

			<LetterEditor
				isPending={isPending}
				letters={letters}
				onDelete={runAction}
				onSubmit={submitLetter}
			/>

			<TimelineEditor
				isPending={isPending}
				onDelete={runAction}
				onSubmit={submitTimeline}
				photos={photos}
				timeline={timeline}
			/>

			<AnniversaryEditor
				anniversaries={anniversaries}
				isPending={isPending}
				onDelete={runAction}
				onSubmit={submitAnniversary}
			/>
		</div>
	);
}

function EditablePhotos({
	isPending,
	onDelete,
	onSubmit,
	photos,
}: {
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
	photos: MemoryPhoto[];
}) {
	return (
		<section className="rounded-lg border bg-card p-5 shadow-sm">
			<h2 className="text-xl font-semibold">编辑照片</h2>
			<div className="mt-5 space-y-4">
				{photos.length === 0 ? (
					<p className="text-sm text-muted-foreground">暂无照片。</p>
				) : (
					photos.map((photo) => (
						<details className="rounded-lg border bg-background p-4" key={photo.id}>
							<summary className="cursor-pointer font-medium">{photo.title}</summary>
							<form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={(event) => onSubmit(event, photo.id)}>
								<Field label="标题">
									<input className={inputClass} defaultValue={photo.title} name="title" required />
								</Field>
								<Field label="替换照片">
									<input accept="image/*" className={inputClass} name="image" type="file" />
								</Field>
								<Field label="日期">
									<input className={inputClass} defaultValue={toDateInputValue(photo.takenAt)} name="takenAt" type="date" />
								</Field>
								<Field label="地点">
									<input className={inputClass} defaultValue={photo.location ?? ""} name="location" />
								</Field>
								<Field label="可见性">
									<select className={selectClass} defaultValue={photo.visibility} name="visibility">
										<option value="public">公开展示</option>
										<option value="private">私密</option>
									</select>
								</Field>
								<Field label="排序权重">
									<input className={inputClass} defaultValue={photo.sortOrder} name="sortOrder" type="number" />
								</Field>
								<Field label="说明">
									<textarea className={textareaClass} defaultValue={photo.description ?? ""} name="description" />
								</Field>
								<div className="flex items-end gap-2">
									<Button disabled={isPending} type="submit">保存</Button>
									<Button
										disabled={isPending}
										onClick={() => onDelete(deletePhoto(photo.id), "照片已删除。")}
										type="button"
										variant="destructive"
									>
										<Trash2 className="size-4" />
										删除
									</Button>
								</div>
							</form>
						</details>
					))
				)}
			</div>
		</section>
	);
}

function LetterEditor({
	isPending,
	letters,
	onDelete,
	onSubmit,
}: {
	isPending: boolean;
	letters: MemoryLetter[];
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
}) {
	return (
		<section className="rounded-lg border bg-card p-5 shadow-sm">
			<h2 className="flex items-center gap-2 text-xl font-semibold">
				<PenLine className="size-5 text-primary" />
				情书 / 留言
			</h2>
			<form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(event) => onSubmit(event)}>
				<Field label="标题">
					<input className={inputClass} name="title" required />
				</Field>
				<Field label="作者">
					<input className={inputClass} name="author" />
				</Field>
				<Field label="日期">
					<input className={inputClass} name="writtenAt" type="date" />
				</Field>
				<Field label="可见性">
					<select className={selectClass} defaultValue="private" name="visibility">
						<option value="public">公开展示</option>
						<option value="private">私密</option>
					</select>
				</Field>
				<div className="md:col-span-2">
					<Field label="正文">
						<textarea className={textareaClass} name="content" required />
					</Field>
				</div>
				<div className="md:col-span-2">
					<Button disabled={isPending} type="submit">
						<Plus className="size-4" />
						添加情书
					</Button>
				</div>
			</form>
			<div className="mt-5 space-y-4">
				{letters.map((letter) => (
					<details className="rounded-lg border bg-background p-4" key={letter.id}>
						<summary className="cursor-pointer font-medium">{letter.title}</summary>
						<form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={(event) => onSubmit(event, letter.id)}>
							<Field label="标题">
								<input className={inputClass} defaultValue={letter.title} name="title" required />
							</Field>
							<Field label="作者">
								<input className={inputClass} defaultValue={letter.author ?? ""} name="author" />
							</Field>
							<Field label="日期">
								<input className={inputClass} defaultValue={toDateInputValue(letter.writtenAt)} name="writtenAt" type="date" />
							</Field>
							<Field label="可见性">
								<select className={selectClass} defaultValue={letter.visibility} name="visibility">
									<option value="public">公开展示</option>
									<option value="private">私密</option>
								</select>
							</Field>
							<div className="md:col-span-2">
								<Field label="正文">
									<textarea className={textareaClass} defaultValue={letter.content} name="content" required />
								</Field>
							</div>
							<div className="flex gap-2 md:col-span-2">
								<Button disabled={isPending} type="submit">保存</Button>
								<Button
									disabled={isPending}
									onClick={() => onDelete(deleteLetter(letter.id), "情书已删除。")}
									type="button"
									variant="destructive"
								>
									<Trash2 className="size-4" />
									删除
								</Button>
							</div>
						</form>
					</details>
				))}
			</div>
		</section>
	);
}

function TimelineEditor({
	isPending,
	onDelete,
	onSubmit,
	photos,
	timeline,
}: {
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
	photos: MemoryPhoto[];
	timeline: MemoryTimelineEvent[];
}) {
	const photoOptions = photos.map((photo) => (
		<option key={photo.id} value={photo.id}>
			{photo.title}
		</option>
	));

	return (
		<section className="rounded-lg border bg-card p-5 shadow-sm">
			<h2 className="text-xl font-semibold">时间线</h2>
			<form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(event) => onSubmit(event)}>
				<Field label="标题">
					<input className={inputClass} name="title" required />
				</Field>
				<Field label="日期">
					<input className={inputClass} name="eventDate" required type="date" />
				</Field>
				<Field label="地点">
					<input className={inputClass} name="location" />
				</Field>
				<Field label="关联照片">
					<select className={selectClass} name="photoId">
						<option value="">不关联</option>
						{photoOptions}
					</select>
				</Field>
				<Field label="可见性">
					<select className={selectClass} name="visibility">
						<option value="public">公开展示</option>
						<option value="private">私密</option>
					</select>
				</Field>
				<Field label="说明">
					<textarea className={textareaClass} name="description" />
				</Field>
				<div className="md:col-span-2">
					<Button disabled={isPending} type="submit">添加事件</Button>
				</div>
			</form>
			<div className="mt-5 space-y-4">
				{timeline.map((event) => (
					<details className="rounded-lg border bg-background p-4" key={event.id}>
						<summary className="cursor-pointer font-medium">{event.title}</summary>
						<form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={(formEvent) => onSubmit(formEvent, event.id)}>
							<Field label="标题">
								<input className={inputClass} defaultValue={event.title} name="title" required />
							</Field>
							<Field label="日期">
								<input className={inputClass} defaultValue={toDateInputValue(event.eventDate)} name="eventDate" required type="date" />
							</Field>
							<Field label="地点">
								<input className={inputClass} defaultValue={event.location ?? ""} name="location" />
							</Field>
							<Field label="关联照片">
								<select className={selectClass} defaultValue={event.photoId ?? ""} name="photoId">
									<option value="">不关联</option>
									{photoOptions}
								</select>
							</Field>
							<Field label="可见性">
								<select className={selectClass} defaultValue={event.visibility} name="visibility">
									<option value="public">公开展示</option>
									<option value="private">私密</option>
								</select>
							</Field>
							<Field label="说明">
								<textarea className={textareaClass} defaultValue={event.description ?? ""} name="description" />
							</Field>
							<div className="flex gap-2 md:col-span-2">
								<Button disabled={isPending} type="submit">保存</Button>
								<Button
									disabled={isPending}
									onClick={() => onDelete(deleteTimelineEvent(event.id), "时间线事件已删除。")}
									type="button"
									variant="destructive"
								>
									<Trash2 className="size-4" />
									删除
								</Button>
							</div>
						</form>
					</details>
				))}
			</div>
		</section>
	);
}

function AnniversaryEditor({
	anniversaries,
	isPending,
	onDelete,
	onSubmit,
}: {
	anniversaries: MemoryAnniversary[];
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
}) {
	return (
		<section className="rounded-lg border bg-card p-5 shadow-sm">
			<h2 className="flex items-center gap-2 text-xl font-semibold">
				<CalendarHeart className="size-5 text-primary" />
				纪念日
			</h2>
			<form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(event) => onSubmit(event)}>
				<Field label="标题">
					<input className={inputClass} name="title" required />
				</Field>
				<Field label="日期">
					<input className={inputClass} name="date" required type="date" />
				</Field>
				<Field label="类型">
					<select className={selectClass} name="type">
						<option value="annual">每年重复</option>
						<option value="once">一次性日期</option>
					</select>
				</Field>
				<label className="flex items-center gap-2 pt-7 text-sm font-medium">
					<input className="size-4" name="isPrimary" type="checkbox" />
					主要纪念日
				</label>
				<div className="md:col-span-2">
					<Field label="说明">
						<textarea className={textareaClass} name="description" />
					</Field>
				</div>
				<div className="md:col-span-2">
					<Button disabled={isPending} type="submit">添加纪念日</Button>
				</div>
			</form>
			<div className="mt-5 space-y-4">
				{anniversaries.map((item) => (
					<details className="rounded-lg border bg-background p-4" key={item.id}>
						<summary className="cursor-pointer font-medium">{item.title}</summary>
						<form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={(event) => onSubmit(event, item.id)}>
							<Field label="标题">
								<input className={inputClass} defaultValue={item.title} name="title" required />
							</Field>
							<Field label="日期">
								<input className={inputClass} defaultValue={item.date} name="date" required type="date" />
							</Field>
							<Field label="类型">
								<select className={selectClass} defaultValue={item.type} name="type">
									<option value="annual">每年重复</option>
									<option value="once">一次性日期</option>
								</select>
							</Field>
							<label className="flex items-center gap-2 pt-7 text-sm font-medium">
								<input className="size-4" defaultChecked={item.isPrimary} name="isPrimary" type="checkbox" />
								主要纪念日
							</label>
							<div className="md:col-span-2">
								<Field label="说明">
									<textarea className={textareaClass} defaultValue={item.description ?? ""} name="description" />
								</Field>
							</div>
							<div className="flex gap-2 md:col-span-2">
								<Button disabled={isPending} type="submit">保存</Button>
								<Button
									disabled={isPending}
									onClick={() => onDelete(deleteAnniversary(item.id), "纪念日已删除。")}
									type="button"
									variant="destructive"
								>
									<Trash2 className="size-4" />
									删除
								</Button>
							</div>
						</form>
					</details>
				))}
			</div>
		</section>
	);
}
