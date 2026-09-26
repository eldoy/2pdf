#!/usr/bin/env node

var usage = require('../lib/usage.js')
var io = require('../lib/io.js')
var config = require('../lib/config.js')
var create = require('../lib/create.js')

var OPTIONS = {
  displayHeaderFooter: true,
  printBackground: true
}

var input = io(process.argv[2])
var output = process.argv[3]
if (!input || !output) usage()

async function run() {
  console.log(`${input} > ${output}`)
  try {
    var options = { ...OPTIONS, ...config('2pdf'), path: output }
    await create(input, options)
  } catch (e) {
    console.error(`Can't create pdf for ${input}, skipping it...`)
    console.error(e.message)
    process.exitCode = 1
  }
}

run()
