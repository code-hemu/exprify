#!/usr/bin/env node

/*
 * help interactive debugging.
 **/

global.exprify = require('../dist/exprify.min.js')
const repl = require('repl')

repl.start({ useGlobal: true })