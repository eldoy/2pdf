var puppeteer = require('puppeteer')

module.exports = async function create(input, options) {
  var browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })
  try {
    var page = await browser.newPage()
    await page.goto(input, { waitUntil: 'networkidle0' })
    await page.emulateMediaType('screen')
    await page.pdf(options)
  } finally {
    await browser.close()
  }
}
