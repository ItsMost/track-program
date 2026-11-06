import { defineConfig } from 'vitest/config';

// Unit tests only. Live-database checks are in tests/rls (npm run test:rls).
export default defineConfig({
  test: { include: ['src/**/*.test.{js,ts,jsx,tsx}'] },
});
