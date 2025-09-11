import { invoke } from '@tauri-apps/api/core';

/**
 * Saves a temporary file in the Tauri temp directory
 * @param {ArrayBuffer} arrayBuffer - The file data as an ArrayBuffer
 * @param {string} fileName - The name of the file to save
 * @returns {Promise<string>} - The path to the saved temporary file
 * @throws {Error} - If the file cannot be saved
 */
const saveTempFile = async (arrayBuffer, fileName) => {
	const tempDir = await invoke('get_temp_dir');
	const tempPath = `${tempDir}/${Date.now()}_${fileName}`;

	await invoke('write_binary_file', {
		path: tempPath,
		contents: Array.from(new Uint8Array(arrayBuffer))
	});

	return tempPath;
};

/**
 * Processes the body of the request to match Tauri's expected format
 * @param {any} body - The body to process
 * @returns {Promise<{ type: string, data: any }>} - Processed body
 * @throws {Error} - If the body type is unsupported
 */
const processBody = async (body) => {
	if (!body) return undefined;

	if (body instanceof Uint8Array)
		return { type: 'Binary', data: Array.from(body) };
	if (body instanceof ArrayBuffer)
		return { type: 'Binary', data: Array.from(new Uint8Array(body)) };
	if (typeof body === 'string')
		return { type: 'Text', data: body };
	if (typeof body === 'object' && !(body instanceof FormData))
		return { type: 'Json', data: body };

	if (body instanceof FormData) {
		const formFields = [];

		for (const [name, value] of body.entries()) {
			if (typeof value === 'string') {
				formFields.push({
					name,
					value: { kind: 'Text', content: value }
				});
			} else if (value instanceof File) {
				// Read file as bytes
				const bytes = await value.arrayBuffer();
				const tempPath = await saveTempFile(bytes, value.name);

				formFields.push({
					name,
					value: {
						kind: 'File',
						content: {
							path: tempPath,
							file_name: value.name
						}
					}
				});
			};
		};

		return { type: 'FormData', data: formFields };
	};

	throw new Error('Unsupported body type');
};

/**
 * Fetch wrapper for Tauri
 * @param {String} url - URL to fetch
 * @param {{ method: String, headers: Object, body: Any }} options - Fetch options
 * @returns 
 */
const tauriFetch = async (url, options = {}) =>
	!invoke ? fetch :
		new Promise(async (resolve, reject) => {
			const request = {
				url,
				method: options.method || 'GET',
				headers: options.headers ? { ...options.headers } : undefined,
				body: await processBody(options.body)
			};

			try {
				const response = await invoke('tauri_fetch', { request });
				const bytes = new Uint8Array(response.body);
				const decoder = new TextDecoder('utf-8');

				resolve({
					ok: response.status >= 200 && response.status < 300,
					status: response.status,
					headers: new Headers(response.headers),
					arrayBuffer: async () => response.body,
					text: async () => decoder.decode(bytes),
					json: async () => JSON.parse(decoder.decode(bytes)),
					blob: async () => new Blob([bytes], { type: response.headers['content-type'] || 'application/octet-stream' }),
					url: response.url
				});
			} catch (error) {
				// console.error('Network error:', error)
				fetch(url, options)
					.then(res => resolve(res))
			};
		});

export default tauriFetch;