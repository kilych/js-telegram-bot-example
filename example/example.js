'use strict';

const path = require('path');
const makeBot = require(path.dirname(__dirname) + '/src/make-bot.js');
const api = require(__dirname + '/lib/external-api.js');

module.exports = (token, options) => {
  let bot = makeBot(token);

  bot.add('convert/currency',
          'Calc amount in other currency by rate'
          + '\n  Example: /convert_currency_from_usd_to_rub_amount_10',
          {
            from: {
              type: 'string',
              pred: value => /\b([a-z]{3})\b/i.test(value),
              requestText: 'Please send currency (three letter code)'
            },
            to: {
              type: 'string',
              pred: value => /\b([a-z]{3})\b/i.test(value),
              requestText: 'Please send currency (three letter code)'
            },
            amount: {
              type: 'number',
              pred: value => /\b(\d+(\.\d+)?)\b/.test(value),
              requestText: 'Please send amount (number)'
            }
          },
          (params, onResult) => {
            const amount = Number(params.amount);
            const fromto = params.from + params.to;
            if (amount === 0) onResult(amount + ' ' + params.from + ' is '
                                       + amount + ' ' + params.to);
            // else if ()
            else {
            api.getCurrencyRate(fromto)
              .then(rate => {
                const converted = amount * Number(rate);
                const resp = params.amount + ' ' + params.from + ' is '
                      + converted + ' ' + params.to;
                onResult(resp);
              },
                    err => {
                      console.log('convert/currency error: ' + err.message);
                      onResult('Something is bad.');
                    });
            }
            return;
          });

  return bot;
};
