## Installation

```
$ cd path/to/your/project
$ npm i telegram-bot-example --save
```

## Usage

```
const bot = require('telegram-bot-example')(<YOUR TELEGRAM BOT TOKEN>);

bot.start();
```

### Customization

##### Add simple reminder

```Javascript
bot.add(
  // Name of the bot action. Corresponding chat command: /remind
  // Namespace support: namespace/subnamespace/action
  'remind',
  // Help string displays to user who chats with bot.
  `Set reminder with message
  Example: /remind_time_00h00m03s_message_some_crap`,
  // Definition of parameters of the bot action
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
      // Optional. When true the value of parameter is rest of text of message
      // from user instead of one word.
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
```
