# 2pdf

Command line tool for creating PDFs from HTML files.

Based on [puppeteer.](https://github.com/puppeteer/puppeteer)

### Install

```sh
npm i -g 2pdf
```

### Usage

```sh
2pdf input.html output.pdf
```

### Programmatic usage

Install locally with `npm i 2pdf`, then call `pdf(input, output, options)`.
Local HTML paths and HTTP/HTTPS URLs are supported. Options are optional.

```js
var pdf = require('2pdf')

async function run() {
  try {
    await pdf('invoice.html', 'invoice.pdf', { format: 'A4' })
    await pdf('https://example.com', 'page.pdf')
  } catch (err) {
    console.error(err.message)
  }
}

run()
```

The Promise resolves when the PDF is written. It rejects for HTTP status 400
or higher on the final page response, navigation failures, or PDF write errors.
Redirects are followed. The browser is closed after conversion or failure.
The CLI reports these failures with exit code 1.

Both interfaces enable headers/footers and background printing by default.
Config file options override defaults, and API options override config options.
The output argument always takes precedence over the `path` option.

### Configuration

PDF options can be set in `2pdf.json`. The first file found is used, searching
in the current directory, your home directory, then `~/.config/`.
Invalid JSON is reported as an error. YAML configuration is no longer supported.
The command-line output path takes precedence over a configured `path`.

```json
{
  "format": "A4",
  "printBackground": true,
  "displayHeaderFooter": false
}
```

### Tests

Requires Node.js 18 or newer. Install dependencies with `npm install`, then run
`npm test`. Tests include real Chromium conversions using local fixtures and a
local HTTP server; no external websites are needed.

### Troubleshooting

On Debian systems you need these libraries installed:

```
apt install libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0
```

MIT Licensed. Enjoy!
