const { withProjectBuildGradle } = require("expo/config-plugins");

// androidx.core 1.19+ requires compileSdk 37 and AGP 9.1+.
// Expo SDK 54 uses compileSdk 36 and AGP 8.11, so pin to 1.17.0.
const CORE_VERSION = "1.17.0";
const MARKER = "withAndroidXCorePin";

function resolutionBlock(isKotlinDsl) {
  const force = isKotlinDsl
    ? `force("androidx.core:core:${CORE_VERSION}")\n            force("androidx.core:core-ktx:${CORE_VERSION}")`
    : `force "androidx.core:core:${CORE_VERSION}"\n            force "androidx.core:core-ktx:${CORE_VERSION}"`;

  return `
// ${MARKER}: keep androidx.core compatible with Expo SDK 54 (compileSdk 36 / AGP 8.11).
allprojects {
    configurations.configureEach {
        resolutionStrategy {
            ${force}
        }
    }
}
`;
}

module.exports = function withAndroidXCorePin(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes(MARKER)) {
      return config;
    }

    config.modResults.contents += resolutionBlock(
      config.modResults.language !== "groovy",
    );
    return config;
  });
};
