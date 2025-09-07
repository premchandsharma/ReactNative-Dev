module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    ['module:react-native-builder-bob/babel-preset', { modules: 'commonjs' }]
  ],
  plugins: [
    './babel-plugin.js'
  ],
};
