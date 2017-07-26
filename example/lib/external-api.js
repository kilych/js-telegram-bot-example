const get = require('./get');

const rates = {};
const actualTime = 30000; // milliseconds

const yahooOptions = {
  host: 'query.yahooapis.com',
  port: 443,
  path: '/v1/public/yql?format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=&'
    + 'q=select+*+from+yahoo.finance.xchange+where+pair+=+"',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

const getCurrencyRate = fromto => new Promise((resolve, reject) => {
  console.log(`${__filename}::getCurrencyRate`);
  if (rates[fromto] && rates[fromto].actual) {
    console.log(`Rate is still actual: ${JSON.stringify(rates[fromto])}`);
    resolve(rates[fromto].rate);
  } else {
    const ops = Object.assign({}, yahooOptions);
    ops.path += fromto + '"';
    // yahooOptions.path += 'USDRUB,RUBUSD,EURRUB,RUBEUR,EURUSD,USDEUR"';
    get(ops).then(
      (output) => {
        const result = JSON.parse(output);
        const rate = result.query.results.rate.Rate;
        console.log(`Updated ${fromto} rate: ${rate}`);
        resolve(rate);
        rates[fromto] = { rate, actual: true };
        setTimeout(() => { rates[fromto].actual = false; }, actualTime);
      },
      (err) => { reject(err); });
  }
});

exports.getCurrencyRate = getCurrencyRate;
