module.exports = {
  'backend/**/*.ts': () => 'npm run lint --prefix backend',
  'frontend/**/*.{ts,tsx}': () => 'npm run lint --prefix frontend',
};
