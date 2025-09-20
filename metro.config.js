const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Merge NativeWind config
const nativeWindConfig = withNativeWind(config, { input: "./global.css" });

// Add crypto alias
nativeWindConfig.resolver.alias = {
  ...(nativeWindConfig.resolver.alias || {}),
  crypto: "react-native-crypto",
};

module.exports = nativeWindConfig;
