const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Polyfill Node's `buffer` module which react-native-svg imports
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer'),
};

// Allow Metro to transform TypeScript source in react-native-svg and qr packages
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
