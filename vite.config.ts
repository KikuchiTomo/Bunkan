import path from 'path';

import { defineConfig, defineViteConfig } from 'electron-vite';

export default defineConfig({
	renderer: defineViteConfig(({ command, mode }) => {

		return {
			root: 'src/renderer',
			build: {
				rollupOptions: {
					input: path.join(__dirname, 'src/renderer/index.html'),
				},
			},
		};
	}),
});