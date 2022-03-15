const path = require('path')

module.exports = function(file) {
  if (!file) return ''
  if (/https?:\/\//.test(file)) {
    return file
  }
  file = path.resolve(file)
  file = file.replace(/\\/g, '/')
  if (file[0] != '/') {
    file = `/${file}`
  }
  return encodeURI(`file://${file}`).replace(/[?#]/g, encodeURIComponent)
}
