const path = require("path");

module.exports = {
  projectRoot: __dirname,
  watchFolders: [
    path.resolve(__dirname, "../src"),
  ],
  resolver: {
    extraNodeModules: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-native": path.resolve(__dirname, "node_modules/react-native"),
    },
  },
};
