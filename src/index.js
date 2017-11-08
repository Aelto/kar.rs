#! /usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const tokenizer = require('./tokenizer/tokenizer.js')
const parser = require('./parser/parser.js')
const translater = require('./translater/translater.js')

const args = process.argv
const [nodeLocation, karcLocation, ...options] = args

const entryPoint = options.length != 0 ? options[0] : 'kar/main.kar'

if (options.indexOf('--debug') >= 0) {
  process.DEBUG = true
}

if (fs.existsSync(entryPoint)) {
  const fileContent = fs.readFileSync(entryPoint, 'utf8')

  const tokens = tokenizer(fileContent)

  const AST = parser(tokens)
  if (process.DEBUG) {
    console.log(AST.getPrint())
  }

  const output = translater(AST)
  if (process.DEBUG) {
    console.log(output)
  }

  // const outputDir = path.dirname(entryPoint)
  // fs.writeFileSync(outputDir + '/out.cpp', output, 'utf8')
} else {
  printError(`Could not find the entry point \`${chalk.magenta(entryPoint)}\``)
}

function printError(err) {
  console.log(`${chalk.red('Error')} ${err}`)
}
