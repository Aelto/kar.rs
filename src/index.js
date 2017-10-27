#! /usr/bin/env node
'use strict'

const fs = require('fs')
const chalk = require('chalk')
const parser = require('./parser')
const path = require('path')

const args = process.argv
const [nodeLocation, karcLocation, ...options] = args

const entryPoint = options.length != 0 ? options[0] : 'kar/main.kar'

if (options.indexOf('--debug') >= 0) {
  process.DEBUG = true
}


if (fs.existsSync(entryPoint)) {
  const output = parser(fs.readFileSync(entryPoint, 'utf8'))
  const outputDir = path.dirname(entryPoint)

  fs.writeFileSync(outputDir + '/out.cpp', output, 'utf8')

} else {
  printError(`Could not find the entry point \`${chalk.magenta(entryPoint)}\``)
}

function printError(err) {
  console.log(`${chalk.red('Error')} ${err}`)
}
