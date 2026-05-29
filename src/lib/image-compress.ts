/**
 * Client-side utility to compress images and convert them to WebP format.
 * Runs entirely in the browser to offload CPU work from Cloudflare Workers.
 */
export async function compressAndConvertToWebp(
	file: File,
	quality = 0.8,
	maxDimension = 1200
): Promise<File> {
	// Skip compression if not running in browser
	if (typeof window === "undefined" || !window.HTMLCanvasElement) {
		return file;
	}

	// Skip if it's not a compressible image format
	if (!file.type.startsWith("image/")) {
		return file;
	}

	if (file.type.toLowerCase() === "image/gif") {
		return file;
	}

	return new Promise((resolve, reject) => {
		const img = new window.Image();
		img.src = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(img.src);
			const canvas = document.createElement("canvas");
			let width = img.width;
			let height = img.height;

			// Maintain aspect ratio while constraining to maxDimension
			if (width > maxDimension || height > maxDimension) {
				if (width > height) {
					height = Math.round((height * maxDimension) / width);
					width = maxDimension;
				} else {
					width = Math.round((width * maxDimension) / height);
					height = maxDimension;
				}
			}

			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0, width, height);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error("Failed to compress image"));
						return;
					}

					// Build new file name with .webp extension
					const dotIndex = file.name.lastIndexOf(".");
					const baseName = dotIndex !== -1 ? file.name.slice(0, dotIndex) : file.name;
					const webpFile = new File([blob], `${baseName}.webp`, {
						type: "image/webp",
						lastModified: Date.now(),
					});

					resolve(webpFile);
				},
				"image/webp",
				quality
			);
		};

		img.onerror = () => {
			URL.revokeObjectURL(img.src);
			reject(new Error("Failed to load image for compression"));
		};
	});
}
