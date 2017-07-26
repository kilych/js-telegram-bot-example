const http = require('http');
const https = require('https');

/**
 * get: get request returning string contents of url
 * @see: https://stackoverflow.com/a/9577651
 * @param options: http options object
 */
module.exports = options => new Promise((resolve, reject) => {
  console.log(__filename);
  const prot = options.port === 443 ? https : http;
  const req = prot.request(options, (res) => {
    let output = '';
    console.log(`${options.host}:${res.statusCode}`);
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      output += chunk;
    });

    res.on('end', () => {
      if (res.statusCode == 200) resolve(output);
      else reject(new Error(`Status code isn't 200: ${res.statusCode}`));
    });
  });

  req.on('error', (err) => { reject(err); });

  req.end();
});
