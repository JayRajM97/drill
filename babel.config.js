module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 56) auto-adds the react-native-worklets plugin
    // required by Reanimated v4, so no manual plugin entry is needed.
    presets: ['babel-preset-expo'],
  };
};
