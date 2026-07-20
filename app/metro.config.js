const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://metrobundler.dev/docs/configuration
 */
const config = {
  resolver: {
    useWatchman: true, // Forces Metro to bypass Watchman entirely
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);