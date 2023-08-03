/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import * as dotenv from 'dotenv';
import { fileURLToPath, URL } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

dotenv.config();

export default ({ mode }: { mode: string }) =>
  defineConfig({
    server: {
      host: process.env.HOST || undefined,
      port: parseInt(process.env.PORT || '', 10) || undefined,
    },
    build: {
      target: 'es2020',
    },
    resolve: {
      alias: {
        '@/*': fileURLToPath(new URL('./src', import.meta.url)),
        '@mikoto-io/lucid': fileURLToPath(
          new URL('../../packages/lucid/src/index.ts', import.meta.url),
        ),

        '@mikoto-io/permcheck': fileURLToPath(
          new URL('../../packages/permcheck/src/index.ts', import.meta.url),
        ),

        mikotojs: fileURLToPath(
          new URL('../../packages/mikotojs/src/index.ts', import.meta.url),
        ),
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [
            [
              'babel-plugin-styled-components',
              {
                displayName: true,
                fileName: false,
              },
            ],
          ],
        },
      }),
      visualizer() as any,
    ],
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
    },
    envPrefix: ['MIKOTO_', 'PUBLIC_'],
  });
