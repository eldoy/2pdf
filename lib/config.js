var { readFileSync } = require('node:fs')
var { homedir } = require('node:os')
var path = require('node:path')

module.exports = function(name) {
  var home = homedir()
  var dirs = [process.cwd(), home, path.join(home, '.config')]

  for (var dir of dirs) {
    try {
      return JSON.parse(readFileSync(path.join(dir, `${name}.json`), 'utf8'))
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
    }
  }
}
