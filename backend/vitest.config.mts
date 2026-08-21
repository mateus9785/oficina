import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    // Integration tests share one real MySQL database and each resets it
    // (TRUNCATE) in beforeEach. Vitest runs separate test *files* in
    // parallel by default, which lets one file's reset wipe tables another
    // file is mid-test with -- serialize file execution to avoid that.
    fileParallelism: false,
  },
});
