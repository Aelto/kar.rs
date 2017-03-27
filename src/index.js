#! /usr/bin/env node
'use strict';

const fs = require('fs');
const chalk = require('chalk');
const parser = require('./parser');

const args = process.argv;
const [nodeLocation, karcLocation, ...options] = args;

const entryPoint = options.length != 0
  ? options[0]
  : 'main.kar';
  
if (fs.existsSync(entryPoint)) {
  try {

    parser(fs.readFileSync(entryPoint, 'utf8'));
  } catch (e) {
    
    printError(e);
  }
  

} else {

  printError(`Could not find the entry point \`${chalk.magenta(entryPoint)}\``)  
}

function printError(err) {
  console.log(`${chalk.red('Error')} ${err}`);
}