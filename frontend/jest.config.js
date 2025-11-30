module.exports = {
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(react-dnd|dnd-core|@react-dnd|react-dnd-html5-backend|react-dnd-test-backend|axios)/)',
  ],
  moduleNameMapper: {
    '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
  },
};
