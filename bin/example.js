#!/usr/bin/env node

"use strict";

const makeExample = require('../example/');

if (process.argv.length >= 3) {
  const token = process.argv[2];
  makeExample(token).start();
} else {
  console.log('You should specify your Telegram bot token as first parameter.');
  process.exitCode = 1;
}
