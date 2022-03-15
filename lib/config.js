const { read } = require('extras')

module.exports = function(name) {
  const dirs = [
    './',
    '~/',
    '~/.config/'
  ]

  const types = ['json', 'yml']

  for (const dir of dirs) {
    for (const type of types) {
      try {
       return read(`${dir}${name}.${type}`)
      } catch(e) {}
    }
  }
}
