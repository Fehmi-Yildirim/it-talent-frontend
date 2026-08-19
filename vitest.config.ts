import { defineConfig } from 'vitest/config'

export default defineConfig({
    define: {
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
            'http://localhost:3000/api/v1',
        ),
    },

    test: {
        environment: 'jsdom',

        setupFiles: ['./test/setup.ts'],

        include: [
            'test/**/*.{test,spec}.{ts,tsx}',
        ],

        globals: true,

        clearMocks: true,
        restoreMocks: true,
    },
})