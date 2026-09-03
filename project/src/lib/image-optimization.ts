const MAX_OPTIMIZED_SIZE_BYTES = 200 * 1024;

export async function optimizeImage(file: File, maxWidth: number): Promise<File> {
	const sourceUrl = URL.createObjectURL(file);

	try {
		const image = new Image();
		image.src = sourceUrl;
		await new Promise<void>((resolve, reject) => {
			image.onload = () => resolve();
			image.onerror = () => reject(new Error('The selected image could not be read.'));
		});

		const scale = Math.min(1, maxWidth / image.width);
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.round(image.width * scale));
		canvas.height = Math.max(1, Math.round(image.height * scale));
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Image optimization is not supported in this browser.');
		context.drawImage(image, 0, 0, canvas.width, canvas.height);

		let quality = 0.82;
		let blob: Blob | null = null;
		while (quality >= 0.35) {
			blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
			if (blob && blob.size <= MAX_OPTIMIZED_SIZE_BYTES) break;
			quality -= 0.08;
		}

		if (!blob || blob.size > MAX_OPTIMIZED_SIZE_BYTES) {
			throw new Error('This image cannot be compressed below 200KB. Please choose a simpler image.');
		}

		return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
	} finally {
		URL.revokeObjectURL(sourceUrl);
	}
}

export const MAX_OPTIMIZED_IMAGE_SIZE = MAX_OPTIMIZED_SIZE_BYTES;