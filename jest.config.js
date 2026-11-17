module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    '\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|lucide-react-native|react-native-svg|@react-navigation|react-native-screens)/)',
  ],
};
