var { test } = require('node:test')
var assert = require('node:assert/strict')
var puppeteer = require('puppeteer')
var create = require('../../lib/create.js')

test('conversion navigates, uses screen media, and passes PDF options', async t => {
  var calls = []
  var options = { path: 'output.pdf', format: 'A4' }
  var page = {
    goto: async (...args) => calls.push(['goto', ...args]),
    emulateMediaType: async value => calls.push(['media', value]),
    pdf: async value => calls.push(['pdf', value])
  }
  t.mock.method(puppeteer, 'launch', async () => ({
    newPage: async () => page,
    close: async () => calls.push(['close'])
  }))
  await create('file:///document.html', options)
  assert.deepEqual(calls, [
    ['goto', 'file:///document.html', { waitUntil: 'networkidle0' }],
    ['media', 'screen'],
    ['pdf', options],
    ['close']
  ])
})

var stages = ['newPage', 'goto', 'emulateMediaType', 'pdf']
stages.forEach(stage => {
  test(`browser closes when ${stage} fails`, async t => {
    var failure = new Error(`${stage} failed`)
    var closed = 0
    var page = {
      goto: async () => {},
      emulateMediaType: async () => {},
      pdf: async () => {}
    }
    var browser = {
      newPage: async () => page,
      close: async () => { closed++ }
    }
    var target = stage === 'newPage' ? browser : page
    target[stage] = async () => { throw failure }
    t.mock.method(puppeteer, 'launch', async () => browser)
    await assert.rejects(create('file:///document.html', {}), failure)
    assert.equal(closed, 1)
  })
})

test('browser launch failures propagate', async t => {
  var failure = new Error('launch failed')
  t.mock.method(puppeteer, 'launch', async () => { throw failure })
  await assert.rejects(create('file:///document.html', {}), failure)
})
