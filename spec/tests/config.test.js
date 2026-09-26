var { test } = require('node:test')
var assert = require('node:assert/strict')
var { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs')
var { tmpdir } = require('node:os')
var path = require('node:path')
var config = require('../../lib/config.js')

function setup(t) {
  var root = mkdtempSync(path.join(tmpdir(), '2pdf-config-'))
  var cwd = process.cwd()
  var home = process.env.HOME
  var profile = process.env.USERPROFILE
  var dirs = [path.join(root, 'cwd'), path.join(root, 'home')]
  dirs.push(path.join(dirs[1], '.config'))
  for (var dir of dirs) mkdirSync(dir, { recursive: true })
  process.chdir(dirs[0])
  process.env.HOME = dirs[1]
  process.env.USERPROFILE = dirs[1]
  t.after(() => {
    process.chdir(cwd)
    if (home === undefined) delete process.env.HOME
    else process.env.HOME = home
    if (profile === undefined) delete process.env.USERPROFILE
    else process.env.USERPROFILE = profile
    rmSync(root, { recursive: true, force: true })
  })
  return dirs
}

test('missing config leaves defaults available', t => {
  setup(t)
  assert.equal(config('2pdf'), undefined)
})

test('config searches cwd, home, then ~/.config in order', t => {
  var dirs = setup(t)
  for (var i = dirs.length - 1; i >= 0; i--) {
    var options = { format: 'A4', landscape: Boolean(i), scale: i + 1 }
    writeFileSync(path.join(dirs[i], '2pdf.json'), JSON.stringify(options))
    assert.deepEqual(config('2pdf'), options)
  }
})

test('invalid JSON is reported instead of falling back', t => {
  var dirs = setup(t)
  writeFileSync(path.join(dirs[1], '2pdf.json'), '{}')
  writeFileSync(path.join(dirs[0], '2pdf.json'), '{invalid')
  assert.throws(() => config('2pdf'), SyntaxError)
})
