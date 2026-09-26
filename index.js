var io = require('./lib/io.js')
var config = require('./lib/config.js')
var create = require('./lib/create.js')

module.exports = async function pdf(input, output, options) {
  if (!input || !output) {
    throw new TypeError('Input and output are required')
  }
  await create(io(input), {
    displayHeaderFooter: true,
    printBackground: true,
    ...config('2pdf'),
    ...options,
    path: output
  })
}
