var { pathToFileURL } = require('node:url')

module.exports = function(file) {
  if (!file) return ''
  if (/^https?:\/\//i.test(file)) return file
  return pathToFileURL(file).href
}
