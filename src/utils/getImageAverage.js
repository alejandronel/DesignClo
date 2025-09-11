/**
 * @typedef {{
 *  r: Number,
 *  g: Number,
 *  b: Number
 * }} RGBColor
 */

/**
 * Get average colors for segments of an image divided into a grid.
 * @param {HTMLImageElement} image - The image element to analyze (must be loaded).
 * @param {Number} length - Number of segments per axis (grid will be length x length). Default 5.
 * @returns {Promise<RGBColor[]>} - Array of average colors for each segment.
 */
const getImageAverage = (image, length = 5) => new Promise((resolve) => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	canvas.width = image.width;
	canvas.height = image.height;
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	// Segment dimensions (may be fractional)
	const segWidth = canvas.width / length;
	const segHeight = canvas.height / length;

	// Initialize grid accumulators
	const grid = Array.from({ length: length * length }, () =>
		({ r: 0, g: 0, b: 0, count: 0 }));

	// Process each pixel
	for (let y = 0; y < canvas.height; y++) {
		const rowIdx = Math.min(length - 1, Math.floor(y / segHeight)) * length;
		for (let x = 0; x < canvas.width; x++) {
			const colIdx = Math.min(length - 1, Math.floor(x / segWidth));
			const gridIdx = rowIdx + colIdx;
			const pixelIdx = (y * canvas.width + x) * 4;

			// Accumulate RGB values
			grid[gridIdx].r += data[pixelIdx];
			grid[gridIdx].g += data[pixelIdx + 1];
			grid[gridIdx].b += data[pixelIdx + 2];
			grid[gridIdx].count++;
		};
	};

	// Calculate averages for each segment
	const colors = grid.map(segment => {
		if (segment.count > 0) {
			return {
				r: Math.round(segment.r / segment.count),
				g: Math.round(segment.g / segment.count),
				b: Math.round(segment.b / segment.count)
			};
		};
		return { r: 0, g: 0, b: 0 }; // Fallback for empty segments
	});

	resolve(colors);
});

export default getImageAverage;