#!/usr/bin/env node
const { read } = require('extras')
var pdf = require('html-pdf')

const OPTIONS = { format: 'Letter' }

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
    '\nUsage: 2pdf [input1:output1] [input2:output2]'
  ].join('\n'))
  process.exit(0)
}

const files = process.argv.slice(2)
if (!files.length) usage()

const options = { ...OPTIONS, ...getOptions() }

function create(html, output) {
  return new Promise((resolve, reject) => {
    function result(err, res) {
      if (err) reject(err)
      resolve(res)
    }
    pdf.create(html, options).toFile(output, result)
  })
}

function getHTML(file) {
  try {
    return read(file)
  } catch(e) {
    console.log(`Can't read file ${file}, skipping it...`)
  }
  return ''
}

function getIO(file) {
  let [input, output] = file.split(':')
  if (!input.endsWith('.html')) {
    input += '.html'
  }
  if (!output) {
    output = input.replace(/\.html$/, '.pdf')
  }
  if (!output.endsWith('.pdf')) {
    output += '.pdf'
  }
  return [input, output]
}

async function run() {
  for (const file of files) {
    let [input, output] = getIO(file)
    console.log(`Processing ${input} > ${output}...`)
    const html = getHTML(input)
    try {
      await create(html, output || input)
    } catch(e) {
      console.log(`Can't create pdf for ${input}, skipping it...`)
      console.log(e.message)
    }
  }
  process.exit(0)
}

run()
