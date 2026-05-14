import { defineConfig } from 'vite';
import { globSync } from 'glob';
import path from 'node:path';
import { builtinModules } from 'node:module';
import pkg from './package.json' assert { type: 'json' };

const entryPoints = globSync(['src/*.js', 'src/**/*.js'], {
	ignore: ['dist/**', 'tests/**']
});

const input = entryPoints.reduce((acc, file) => {
	const relativePath = path.relative('src', file).replace(/\.js$/, '');
	acc[relativePath] = path.resolve(file);
	return acc;
}, {});

// Собираем список всех внешних зависимостей, чтобы Vite их не инлайнил
const externalDeps = [
	'eventemitter2', 'pg', 'undici',
	...builtinModules,
	...builtinModules.map(m => `node:${m}`),
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.peerDependencies || {})
];

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		lib: {
			entry: input,
			formats: ['cjs']
		},
		rollupOptions: {
			// КРИТИЧНО: Указываем Rollup не трогать системные модули и сторонние npm-пакеты
			external: (id) => externalDeps.some(dep => id === dep || id.startsWith(`${dep}/`)),
			output: {
				entryFileNames: '[name].cjs',
				chunkFileNames: '[name].cjs',
				assetFileNames: '[name].[ext]',
				exports: 'named'
			}
		},
		minify: false,
		sourcemap: true
	}
});
