
/**
 * Find top non-transparent row
 * @param {Uint8ClampedArray} data - Image pixel data
 * @param {Number} width - Image width
 * @param {Number} height - Image height
 * @returns {Number} - Index of the first non-transparent row
 */
const findTop = (data, width, height) => {
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const alpha = data[(y * width + x) * 4 + 3];
			if (alpha > 0) return y;
		};
	};
	return 0;
};

/**
 * Find bottom non-transparent row
 * @param {Uint8ClampedArray} data - Image pixel data
 * @param {Number} width - Image width
 * @param {Number} height - Image height
 * @return {Number} - Index of the last non-transparent row
 */
const findBottom = (data, width, height) => {
	for (let y = height - 1; y >= 0; y--) {
		for (let x = 0; x < width; x++) {
			const alpha = data[(y * width + x) * 4 + 3];
			if (alpha > 0) return y;
		};
	};
	return height - 1;
};

/**
 * Find left non-transparent column
 * @param {Uint8ClampedArray} data - Image pixel data
 * @param {Number} width - Image width
 * @param {Number} height - Image height
 * @param {Number} top - Top row index of the bounding box
 * @param {Number} bottom - Bottom row index of the bounding box
 * @return {Number} - Index of the first non-transparent column
 */
const findLeft = (data, width, height, top, bottom) => {
	for (let x = 0; x < width; x++) {
		for (let y = top; y <= bottom; y++) {
			const alpha = data[(y * width + x) * 4 + 3];
			if (alpha > 0) return x;
		};
	};
	return 0;
};

/**
 * Find right non-transparent column
 * @param {Uint8ClampedArray} data - Image pixel data
 * @param {Number} width - Image width
 * @param {Number} height - Image height
 * @param {Number} top - Top row index of the bounding box
 * @param {Number} bottom - Bottom row index of the bounding box
 * @return {Number} - Index of the last non-transparent column
 */
const findRight = (data, width, height, top, bottom) => {
	for (let x = width - 1; x >= 0; x--) {
		for (let y = top; y <= bottom; y++) {
			const alpha = data[(y * width + x) * 4 + 3];
			if (alpha > 0) return x;
		};
	};
	return width - 1;
};

/**
 * Crop an image to its non-transparent content.
 * @param {String} imageSrc - Source URL of the image to crop.
 * @returns {Promise<String>} - Promise resolving to the cropped image data URL (PNG format
 * @returns 
 */
const cropAlpha = (imageSrc) => new Promise((resolve, reject) => {
	const img = new Image();
	img.crossOrigin = "Anonymous"; // Enable CORS if needed
	img.src = imageSrc;

	img.onload = () => {
		try {
			// Create canvas to analyze image
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);

			// Get image data (RGBA)
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			// Find boundaries of non-transparent content
			let top = findTop(data, canvas.width, canvas.height);
			let bottom = findBottom(data, canvas.width, canvas.height);
			let left = findLeft(data, canvas.width, canvas.height, top, bottom);
			let right = findRight(data, canvas.width, canvas.height, top, bottom);

			// Handle fully transparent images
			if (top > bottom || left > right) {
				top = left = 0;
				bottom = canvas.height - 1;
				right = canvas.width - 1;
			};

			// Calculate crop dimensions
			const width = right - left + 1;
			const height = bottom - top + 1;

			// Create cropped canvas
			const croppedCanvas = document.createElement('canvas');
			croppedCanvas.width = width;
			croppedCanvas.height = height;
			const croppedCtx = croppedCanvas.getContext('2d');

			// Draw cropped region
			croppedCtx.drawImage(
				img,
				left, top, width, height, // Source region
				0, 0, width, height      // Destination region
			);

			// Resolve with data URL (PNG format)
			resolve(croppedCanvas.toDataURL('image/png'));
		} catch (error) {
			reject(error);
		};
	};

	img.onerror = () => reject(new Error('Failed to load image'));
});

export default cropAlpha;