'use strict';

const path = require('path');
const makeBot = require(path.dirname(__dirname) + '/src/make-bot.js');
const api = require(__dirname + '/lib/external-api.js');

module.exports = (token, options) => {
  let bot = makeBot(token);

  bot.add('remind',
          'Set reminder with message'
          + '\n  Example: /remind_time_00h00m03s_message_some_crap',
          {
            time: {
              type: 'string',
              pred: str => /^(\d?\dh)?(\d?\dm)?(\d?\ds)?$/.test(str),
              requestText: 'Please send time interval (Example: /00h00m03s)'
            },
            message: {
              type: 'number',
              pred: value => true,
              requestText: 'Please send reminder message',
              needRawText: true
            }
          },
          (values, onResult, onError) => {
            const resp = `REMINDER: ${values.message}`;
            const match = /^((\d?\d)h)?((\d?\d)m)?((\d?\d)s)?$/.exec(values.time);
            const hours = Number(match[2]) || 0;
            const mins = Number(match[4]) || 0;
            const secs = Number(match[6]) || 0;
            const ms = (3600 * hours + 60 * mins + secs) * 1000;
            setTimeout(() => { onResult(resp); }, ms);
            onResult('REMINDER set.');
            return;
          });

  bot.add('convert/currency',
          'Calc amount in other currency by rate'
          + '\n  Example: /convert_currency_from_usd_to_rub_amount_10',
          {
            from: {
              type: 'string',
              pred: value => /\b([a-z]{3})\b/i.test(value),
              requestText: 'Please send "from" currency (three letter code)'
            },
            to: {
              type: 'string',
              pred: value => /\b([a-z]{3})\b/i.test(value),
              requestText: 'Please send "to" currency (three letter code)'
            },
            amount: {
              type: 'number',
              pred: value => /\b(\d+(\.\d+)?)\b/.test(value),
              requestText: 'Please send amount (number)'
            }
          },
          (values, onResult, onError) => {
            const amount = Number(values.amount);
            const fromto = values.from + values.to;
            if (amount === 0) onResult(`${amount} ${values.from} is ${amount} ${values.to}`);
            // else if ()
            else {
              api.getCurrencyRate(fromto).then(
                rate => {
                  const converted = amount * Number(rate);
                  const resp = `${values.amount} ${values.from} is ${converted} ${values.to}`;
                  onResult(resp);
                },
                onError);
            }
            return;
          });

  return bot;
};
