#!/usr/bin/env node
const usage = require('../lib/usage.js')
const io = require('../lib/io.js')
const config = require('../lib/config.js')
const create = require('../lib/create.js')

const OPTIONS = {
  displayHeaderFooter: true,
  printBackground: true
}

let input = io(process.argv[2])
let output = process.argv[3]
if (!input || !output) usage()

const options = { path: output, ...OPTIONS, ...config('2pdf') }

async function run() {
  console.log(`${input} > ${output}`)
  try {
    await create(input, options)
  } catch(e) {
    console.log(`Can't create pdf for ${input}, skipping it...`)
    console.log(e.message)
  }
  process.exit(0)
}

run()
