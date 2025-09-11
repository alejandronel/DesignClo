/**
 * Check if a font is available in the browser
 * @param {string} fontToTest - Font name to check
 * @param {Object} options - Optional configuration
 * @param {string} options.testText - Text to use for testing
 * @param {number} options.width - Canvas width
 * @param {number} options.height - Canvas height
 * @returns {Promise<boolean>} - Promise resolving to true if font is available
 */
const checkFont = (fontToTest, options = {}) =>
	new Promise((resolve) => {
		const testText = options.testText || 'The brown fox jumps over a fence';
		const width = options.width || 500;
		const height = options.height || 100;
		
		// Create canvas element for testing
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		
		// Skip test if checking Arial (our reference font)
		if (fontToTest.toLowerCase() === 'arial') {
			resolve(true);
			return;
		};
		
		// Generate reference Arial SVG
		const arialSVG = encodeURIComponent(`
			<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
				<foreignObject width="100%" height="100%">
					<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">
						<span style="font-family:Arial;">${testText}</span>
					</div>
				</foreignObject>
			</svg>
		`);
		
		const img = new Image();
		let arialBmp;
		
		// Load reference image first
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			arialBmp = ctx.getImageData(0, 0, width, height).data;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			// Now test the requested font
			const fontSVG = encodeURIComponent(`
				<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
					<foreignObject width="100%" height="100%">
						<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">
							<span style="font-family: ${fontToTest}, Arial;">${testText}</span>
						</div>
					</foreignObject>
				</svg>
			`);
			
			img.onload = () => {
				ctx.drawImage(img, 0, 0);
				const fontBmp = ctx.getImageData(0, 0, width, height).data;
				
				// Check if image is blank (all zeros)
				let isAllZero = true;
				for (let i = 0; i < fontBmp.length; i++) {
					if (fontBmp[i] !== 0) {
						isAllZero = false;
						break;
					};
				};
				
				if (isAllZero) {
					resolve(false);
					return;
				};
				
				// Compare with reference image
				for (let i = 0; i < arialBmp.length; i++) {
					if (arialBmp[i] !== fontBmp[i]) {
						resolve(true);
						return;
					};
				};
				
				resolve(false);
			};
			
			img.src = "data:image/svg+xml," + fontSVG;
		};
		
		img.src = "data:image/svg+xml," + arialSVG;
	});

export default checkFont;