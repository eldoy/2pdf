var { test } = require('node:test')
var assert = require('node:assert/strict')
var { mkdtempSync, writeFileSync, rmSync } = require('node:fs')
var { tmpdir } = require('node:os')
var path = require('node:path')
var { pathToFileURL } = require('node:url')
var puppeteer = require('puppeteer')
var pdf = require('../..')

function setup(t) {
  var cwd = process.cwd()
  var home = process.env.HOME
  var profile = process.env.USERPROFILE
  var root = mkdtempSync(path.join(tmpdir(), '2pdf-api-'))
  process.chdir(root)
  process.env.HOME = root
  process.env.USERPROFILE = root
  t.after(() => {
    process.chdir(cwd)
    if (home === undefined) delete process.env.HOME
    else process.env.HOME = home
    if (profile === undefined) delete process.env.USERPROFILE
    else process.env.USERPROFILE = profile
    rmSync(root, { recursive: true, force: true })
  })
  var result = {}
  t.mock.method(puppeteer, 'launch', async () => ({
    newPage: async () => ({
      goto: async input => { result.input = input },
      emulateMediaType: async () => {},
      pdf: async options => { result.options = options }
    }),
    close: async () => { result.closed = true }
  }))
  return result
}

test('package API accepts local paths with default options', async t => {
  var result = setup(t)
  await pdf('invoice #1.html', 'invoice.pdf')
  assert.equal(result.input, pathToFileURL('invoice #1.html').href)
  assert.deepEqual(result.options, {
    displayHeaderFooter: true,
    printBackground: true,
    path: 'invoice.pdf'
  })
  assert.equal(result.closed, true)
})

test('API options override config and preserve the output argument', async t => {
  var result = setup(t)
  writeFileSync('2pdf.json', JSON.stringify({
    format: 'Letter', landscape: true, printBackground: false
  }))
  var options = { format: 'A4', path: 'wrong.pdf' }
  await pdf('https://example.com/invoice', 'invoice.pdf', options)
  assert.equal(result.input, 'https://example.com/invoice')
  assert.deepEqual(result.options, {
    displayHeaderFooter: true,
    printBackground: false,
    format: 'A4',
    landscape: true,
    path: 'invoice.pdf'
  })
  assert.deepEqual(options, { format: 'A4', path: 'wrong.pdf' })
})

test('API rejects missing arguments before launching a browser', async t => {
  var launch = t.mock.method(puppeteer, 'launch', async () => {
    assert.fail('Browser must not launch')
  })
  await assert.rejects(pdf(), /Input and output are required/)
  await assert.rejects(pdf('invoice.html'), /Input and output are required/)
  assert.equal(launch.mock.callCount(), 0)
})

test('API propagates conversion errors', async t => {
  setup(t)
  var failure = new Error('Browser launch failed')
  t.mock.method(puppeteer, 'launch', async () => { throw failure })
  await assert.rejects(pdf('invoice.html', 'invoice.pdf'), failure)
})
