const makeBot = require('../src/make-bot.js');
const api = require('./lib/external-api.js');

module.exports = (token, options) => {
  const bot = makeBot(token);

  bot.add(
    'remind',
    `Set reminder with message
       Example: /remind_time_00h00m03s_message_some_crap`,
    {
      time: {
        type: 'string',
        pred: str => /^(\d?\dh)?(\d?\dm)?(\d?\ds)?$/.test(str),
        requestText: 'Please send time interval',
        exampleValues: ['1s', '00h2s', '01m', '00h00m03s'],
      },
      message: {
        type: 'number',
        pred: value => true,
        requestText: 'Please send reminder message',
        needRawText: true,
      },
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
    });

  bot.add(
    'convert/currency',
    'Calc amount in other currency by rate'
      + '\n  Example: /convert_currency_from_usd_to_rub_amount_10',
    {
      from: {
        type: 'string',
        pred: value => /\b([a-z]{3})\b/i.test(value),
        requestText: 'Please send "from" currency (three letter code)',
        exampleValues: ['usd', 'eur', 'rub'],
      },
      to: {
        type: 'string',
        pred: value => /\b([a-z]{3})\b/i.test(value),
        requestText: 'Please send "to" currency (three letter code)',
        exampleValues: ['usd', 'eur', 'rub'],
      },
      amount: {
        type: 'number',
        pred: value => /\b(\d+(\.\d+)?)\b/.test(value),
        requestText: 'Please send amount (number)',
        exampleValues: ['1', '10', '100', '1000'],
      },
    },
    (values, onResult, onError) => {
      const amount = Number(values.amount);
      const from = values.from.toUpperCase();
      const to = values.to.toUpperCase();
      const fromto = from + to;
      if (amount === 0 || from === to) onResult(`${amount} ${from} is ${amount} ${to}`);
      else {
        api.getCurrencyRate(fromto).then(
          (rate) => {
            const converted = amount * Number(rate);
            const resp = `${amount} ${from} is ${converted} ${to}`;
            onResult(resp);
          },
          onError);
      }
    });

  return bot;
};
