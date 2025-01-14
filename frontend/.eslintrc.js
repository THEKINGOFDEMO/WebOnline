module.exports = {
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
} 