module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['vuetify'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
