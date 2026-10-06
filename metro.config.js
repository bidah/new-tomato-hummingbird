const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// NativeWind compiles `global.css` through Tailwind at bundle time; `genux
// export` runs `expo export` here, so the guest's Metro config is what applies.
const config = getDefaultConfig(__dirname);
// api/ is a separate Node (Hono) project with its own node_modules — keep it out of the app bundle.
config.resolver.blockList = [/\/api\/.*/];

module.exports = withNativeWind(config, { input: './global.css' });
