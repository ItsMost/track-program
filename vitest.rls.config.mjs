import { defineConfig } from 'vitest/config';

// Live-database security checks (needs .env or .env.off). Run: npm run test:rls
export default defineConfig({
  test: { include: ['tests/rls/**/*.rls.test.js'], testTimeout: 20000 },
});
