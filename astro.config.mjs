import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://soymachine.github.io',
  base: '/rock-paper-scissors',
  vite: {
    optimizeDeps: {
      include: ['phaser'],
    },
  },
});
