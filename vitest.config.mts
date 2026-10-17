import { defineConfig } from 'vitest/config';

// Unit tests of the logic that needs no browser; vite.config.mts builds the site
export default defineConfig({
    test: {
        include: ['sources/src/**/*.test.ts'],
    },
});
