/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: "off" */
/* eslint import/no-unresolved: "off" */
/* eslint global-require: "off" */
/* eslint no-param-reassign: ["error", { "props": false }] */
const path = require('path');
const fs = require('fs');
const less = require('./utils/less');
const autoprefixer = require('./utils/autoprefixer');
const cleanCSS = require('./utils/clean-css');
const banner = require('./banner.js');

async function build(cb) {
  const env = process.env.NODE_ENV || 'development';

  const lessContent = fs.readFileSync(path.resolve(__dirname, '../src/framework7.feeds.less'), 'utf-8');
  const cssContent = await autoprefixer(await less(lessContent, path.resolve(__dirname, '../src/core')));

  // Write file
  fs.writeFileSync(`${env === 'development' ? 'build' : 'dist'}/framework7.feeds.css`, `${banner}\n${cssContent}`);

  const minifiedContent = await cleanCSS(cssContent);

  fs.writeFileSync(`${env === 'development' ? 'build' : 'dist'}/framework7.feeds.min.css`, `${banner}\n${minifiedContent}`);

  if (cb) cb();
}


function buildLess(cb) {
  build(cb);
}

module.exports = buildLess;
