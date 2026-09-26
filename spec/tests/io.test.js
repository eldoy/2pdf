var { test } = require('node:test')
var assert = require('node:assert/strict')
var path = require('node:path')
var { fileURLToPath } = require('node:url')
var io = require('../../lib/io.js')

test('missing input returns an empty string', () => {
  assert.equal(io(), '')
  assert.equal(io(''), '')
})

test('HTTP and HTTPS URLs are preserved', () => {
  for (var url of ['http://localhost/a', 'https://example.com/a?q=1#b',
    'HTTPS://example.com/a']) {
    assert.equal(io(url), url)
  }
})

test('local paths round trip without losing special characters', () => {
  for (var name of ['document.html', 'a b.html', 'æøå.html',
    'a%20b.html', 'a#b?.html', 'folder/https://example.html']) {
    assert.equal(fileURLToPath(io(name)), path.resolve(name))
  }
  var absolute = path.resolve('document.html')
  assert.equal(fileURLToPath(io(absolute)), absolute)
})
