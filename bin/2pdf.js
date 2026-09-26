#!/usr/bin/env node

var usage = require('../lib/usage.js')
var pdf = require('../index.js')

var input = process.argv[2]
var output = process.argv[3]
if (!input || !output) usage()

async function run() {
  console.log(`${input} > ${output}`)
  try {
    await pdf(input, output)
  } catch (e) {
    console.error(`Can't create pdf for ${input}, skipping it...`)
    console.error(e.message)
    process.exitCode = 1
  }
}

run()
