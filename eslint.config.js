import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  formatters: true,
  ignores: [
    'openspec',
  ],
})
