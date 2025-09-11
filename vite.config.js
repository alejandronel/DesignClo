import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
	clearScreen: false,
	server: {
		host: host || false,
		port: 1420,
		strictPort: true,
		hmr: host
			? {
				protocol: 'ws',
				host,
				port: 1421,
			}
			: undefined
	},
	plugins: [react(), svgr({ svgrOptions: { icon: true } })]
});