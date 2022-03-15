const puppeteer = require('puppeteer')

module.exports = async function create(input, options) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(input, { waitUntil: 'networkidle0' })
  await page.emulateMediaType('screen')
  await page.pdf(options)
  await browser.close()
}
