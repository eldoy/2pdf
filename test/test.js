const assert = require('assert')
const io = require('../lib/io.js')

const root = process.cwd()

let name = 'file'
let input = io(name)
assert.ok(input == `file://${root}/${name}`)

name = 'https://eldoy.com/cv.html'
input = io(name)
assert.ok(input == name)

input = io(undefined)
assert.ok(input == '')
