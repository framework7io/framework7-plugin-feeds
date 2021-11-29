/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: "off" */

const fs = require('fs');
const rollup = require('rollup');
const { minify } = require('terser');
const banner = require('./banner.js');

async function es(cb) {
  const env = process.env.NODE_ENV || 'development';

  const bundle = await rollup.rollup({
    input: './src/framework7.feeds.js',
  });

  await bundle.write({
    format: 'es',
    name: 'Framework7Feeds',
    file: `${env === 'development' ? 'build' : 'dist'}/framework7.feeds.esm.js`,
    strict: true,
    sourcemap: false,
    banner,
  });

  if (cb) cb();
}
async function umd(cb) {
  const env = process.env.NODE_ENV || 'development';

  const bundle = await rollup.rollup({
    input: './src/framework7.feeds.js',
  });

  const result = await bundle.write({
    format: 'umd',
    name: 'Framework7Feeds',
    file: `${env === 'development' ? 'build' : 'dist'}/framework7.feeds.js`,
    strict: true,
    sourcemap: true,
    banner,
  });

  const output = result.output[0];

  const minified = await minify(output.code, {
    sourceMap: {
      content: output.map,
      filename: 'framework7.feeds.min.js',
      url: 'framework7.feeds.min.js.map',
    },
    output: {
      preamble: banner,
    },
  });

  fs.writeFileSync(`${env === 'development' ? 'build' : 'dist'}/framework7.feeds.min.js`, minified.code);
  fs.writeFileSync(`${env === 'development' ? 'build' : 'dist'}/framework7.feeds.min.js.map`, minified.map);

  if (cb) cb();
}
function buildJs(cb) {
  const env = process.env.NODE_ENV || 'development';

  const expectCbs = env === 'development' ? 1 : 2;
  let cbs = 0;

  umd(() => {
    cbs += 1;
    if (cbs === expectCbs) cb();

    if (env === 'production') {
      es(() => {
        cbs += 1;
        if (cbs === expectCbs) cb();
      });
    }
  });
}

module.exports = buildJs;
