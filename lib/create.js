var puppeteer = require('puppeteer')

module.exports = async function create(input, options) {
  var browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })
  try {
    var page = await browser.newPage()
    var response = await page.goto(input, { waitUntil: 'networkidle0' })
    if (response && response.status() >= 400) {
      throw new Error(`HTTP ${response.status()} for ${response.url()}`)
    }
    await page.emulateMediaType('screen')
    await page.pdf(options)
  } finally {
    await browser.close()
  }
}
