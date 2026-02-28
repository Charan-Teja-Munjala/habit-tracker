const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure Metro resolves to CJS versions of packages that use import.meta (ESM)
// This prevents "import.meta is not supported in Hermes" errors
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Block .mjs resolution for packages that ship broken ESM for React Native
config.resolver.unstable_conditionNames = ['require', 'default'];

module.exports = config;
