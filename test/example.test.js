'use strict';

const assert = require('assert');
const userProt = require('../src/user-prototype.js');
const bot = require('../example/example.js')();

describe('Convert currency test', () => {
  let user = Object.create(userProt).init(bot.actions);

  it('should handle dialog', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/convert', from: {}, chat: {}});
    assert.equal(respText, 'Please send command\n/currency');

    respText = '';
    user.handleMsg({text: 'currency', from: {}, chat: {}});
    assert.equal(respText, 'Please send currency (three letter code)');

    respText = '';
    user.handleMsg({text: 'usd', from: {}, chat: {}});
    assert.equal(respText, 'Please send currency (three letter code)');

    respText = '';
    user.handleMsg({text: 'rub', from: {}, chat: {}});
    assert.equal(respText, 'Please send amount (number)');

    respText = '';
    user.handleMsg({text: '0.0', from: {}, chat: {}});
    assert.equal(respText, '0 usd is 0 rub');
  });

  it('should response "0 rub is 0 usd" and clean state', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/convert_currency_amount_0_from_rub_to_usd', from: {}, chat: {}});
    assert.equal(user.state.stack.length, 0);
    assert.equal(respText, '0 rub is 0 usd');
  });

  it('should response ' + bot.actions.params.convert.currency.amount.requestText, () => {
    let respText = '';
    const expected = bot.actions.params.convert.currency.amount.requestText;
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/convert_currency_from_rub_to_usd amount some crap', from: {}, chat: {}});
    assert.equal(respText, expected);
    user.handleMsg({text:'0', from: {}, chat: {}});
    assert.equal(respText, '0 rub is 0 usd');
  });

  it('should response ' + bot.actions.params.convert.currency.amount.requestText, () => {
    let respText = '';
    const expected = bot.actions.params.convert.currency.amount.requestText;
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/convert_currency_from_rub_to_usd', from: {}, chat: {}});
    assert.equal(respText, expected);
    user.handleMsg({text:'0', from: {}, chat: {}});
    assert.equal(respText, '0 rub is 0 usd');
  });
});
