#!/usr/bin/env node
const { read } = require('extras')
const puppeteer = require('puppeteer')
const io = require('../lib/io.js')

const OPTIONS = {}

function getOptions() {
  const dirs = [
    './',
    '~/',
    '~/.config/'
  ]

  const types = ['json', 'yml']

  for (const dir of dirs) {
    for (const type of types) {
      try {
       return read(`${dir}2pdf.${type}`)
      } catch(e) {}
    }
  }
}

function usage() {
  console.log([
    '\nUsage: 2pdf [input] [output]'
  ].join('\n'))
  process.exit(0)
}

let input = io(process.argv[2])
let output = process.argv[3]
if (!input || !output) usage()

const options = { path: output, ...OPTIONS, ...getOptions() }

async function create() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(input, { waitUntil: 'networkidle0' })
  await page.pdf(options)
  await browser.close()
}

async function run() {
  console.log(`${input} > ${output}`)
  try {
    await create()
  } catch(e) {
    console.log(`Can't create pdf for ${input}, skipping it...`)
    console.log(e.message)
  }
  process.exit(0)
}

run()
