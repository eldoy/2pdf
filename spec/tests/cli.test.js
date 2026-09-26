var { test } = require('node:test')
var assert = require('node:assert/strict')
var { execFile } = require('node:child_process')
var { promisify } = require('node:util')
var { mkdtemp, readFile, writeFile, rm } = require('node:fs/promises')
var { tmpdir } = require('node:os')
var path = require('node:path')
var { createServer } = require('node:http')
var { once } = require('node:events')
var puppeteer = require('puppeteer')
var exec = promisify(execFile)
var cli = path.resolve(__dirname, '../../bin/2pdf.js')
var fixtures = path.resolve(__dirname, '../fixtures')

async function setup(t) {
  var cwd = await mkdtemp(path.join(tmpdir(), '2pdf-cli-'))
  t.after(() => rm(cwd, { recursive: true, force: true }))
  var run = (...args) => exec(process.execPath, [cli, ...args], {
    cwd,
    env: {
      ...process.env,
      HOME: cwd,
      USERPROFILE: cwd,
      PUPPETEER_EXECUTABLE_PATH: puppeteer.executablePath()
    },
    timeout: 30000
  })
  return { cwd, run }
}

async function assertPDF(file) {
  var pdf = await readFile(file)
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-')
  assert.match(pdf.subarray(-1024).toString(), /%%EOF/)
  assert.ok(pdf.length > 1000)
}

test('missing arguments show usage', async t => {
  var { run } = await setup(t)
  var { stdout } = await run()
  assert.match(stdout, /Usage: 2pdf/)
})

test('local HTML produces a PDF at the explicit output path', async t => {
  var { cwd, run } = await setup(t)
  await writeFile(path.join(cwd, '2pdf.json'), JSON.stringify({
    format: 'A4', path: 'wrong.pdf', displayHeaderFooter: false
  }))
  await run(path.join(fixtures, 'document.html'), 'result #1.pdf')
  await assertPDF(path.join(cwd, 'result #1.pdf'))
  await assert.rejects(readFile(path.join(cwd, 'wrong.pdf')), { code: 'ENOENT' })
})

test('HTTP HTML loads relative CSS and produces a PDF', async t => {
  var { cwd, run } = await setup(t)
  var requests = []
  var server = createServer(async (req, res) => {
    requests.push(req.url)
    var file = req.url === '/document.css' ? 'document.css' : 'document.html'
    try {
      res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : 'text/html')
      res.end(await readFile(path.join(fixtures, file)))
    } catch {
      res.statusCode = 500
      res.end()
    }
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise(resolve => server.close(resolve)))
  await run(`http://127.0.0.1:${server.address().port}/`, 'result.pdf')
  await assertPDF(path.join(cwd, 'result.pdf'))
  assert.ok(requests.includes('/document.css'))
})

test('missing input files fail with a nonzero exit status', async t => {
  var { cwd, run } = await setup(t)
  await assert.rejects(run('missing.html', 'result.pdf'), error => {
    assert.equal(error.code, 1)
    assert.match(error.stderr, /ERR_FILE_NOT_FOUND/)
    return true
  })
  await assert.rejects(readFile(path.join(cwd, 'result.pdf')), { code: 'ENOENT' })
})

test('malformed config fails with a nonzero exit status', async t => {
  var { cwd, run } = await setup(t)
  await writeFile(path.join(cwd, '2pdf.json'), '{invalid')
  await assert.rejects(run(path.join(fixtures, 'document.html'), 'result.pdf'),
    error => {
      assert.equal(error.code, 1)
      assert.match(error.stderr, /Can't create pdf/)
      return true
    })
})

test('HTTP errors after redirects fail without creating a PDF', async t => {
  var { cwd, run } = await setup(t)
  var server = createServer((req, res) => {
    if (req.url === '/redirect') {
      res.writeHead(302, { Location: '/404' })
    } else {
      res.writeHead(Number(req.url.slice(1)) || 404)
    }
    res.end('Error page')
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise(resolve => server.close(resolve)))
  var base = `http://127.0.0.1:${server.address().port}`
  for (var route of ['/redirect', '/500']) {
    var status = route === '/redirect' ? 404 : 500
    await assert.rejects(run(`${base}${route}`, 'error.pdf'), error => {
      assert.equal(error.code, 1)
      assert.ok(error.stderr.includes(`HTTP ${status} for ${base}/${status}`))
      return true
    })
    await assert.rejects(readFile(path.join(cwd, 'error.pdf')), {
      code: 'ENOENT'
    })
  }
})
