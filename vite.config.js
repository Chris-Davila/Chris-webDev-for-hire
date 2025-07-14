import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'~lightbox2': path.resolve(__dirname, 'node_modules/lightbox2')
		}
	},
	build: {
		// This ensures Lightbox's assets are properly included in the build
		assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif'],
		// rollupOptions: {
		// 	external: ['jquery'],
		// 	output: {
		// 		globals: {
		// 			jquery: 'jQuery'
		// 		}
		// 	}
		// }
	}
});