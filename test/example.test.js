'use strict';

const assert = require('assert');
const userProt = require('../src/user-prototype');
const bot = require('../example/')();

describe('TEST: example convert currency command', () => {
  const user = Object.create(userProt).init(bot.actions);

  it('should request command', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/convert', from: {}, chat: {} });
    assert.equal(respText, 'Please send command\n/currency');
  });

  it('should request command', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: ' some crap ', from: {}, chat: {} });
    assert.equal(respText, 'Please send command\n/currency');
  });

  it('should request "from" currency', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: 'currency', from: {}, chat: {} });
    assert.equal(respText, 'Please send "from" currency (three letter code)\nFor example, /usd /eur /rub');
  });

  it('should request "from" currency', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: 'some crap', from: {}, chat: {} });
    assert.equal(respText, 'Please send "from" currency (three letter code)\nFor example, /usd /eur /rub');
  });

  it('should request "to" currency', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: 'usd', from: {}, chat: {} });
    assert.equal(respText, 'Please send "to" currency (three letter code)\nFor example, /usd /eur /rub');
  });

  it('should request "to" currency', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: 'some crap', from: {}, chat: {} });
    assert.equal(respText, 'Please send "to" currency (three letter code)\nFor example, /usd /eur /rub');
  });

  it('should request amount', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/rub some crap', from: {}, chat: {} });
    assert.equal(respText, 'Please send amount (number)\nFor example, /1 /10 /100 /1000');
  });

  it('should request amount', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: 'some crap ', from: {}, chat: {} });
    assert.equal(respText, 'Please send amount (number)\nFor example, /1 /10 /100 /1000');
  });

  it('should response "0 RUB is 0 USD" and clean state (end of dialog)', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '0.0', from: {}, chat: {} });
    assert.equal(user.state.stack.length, 0);
    assert.equal(respText, '0 USD is 0 RUB');
  });

  it('should response "0 RUB is 0 USD" and clean state', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/convert_currency_amount_0_from_rub_to_usd', from: {}, chat: {} });
    assert.equal(user.state.stack.length, 0);
    assert.equal(respText, '0 RUB is 0 USD');
  });

  it('should request amount, then handle the amount', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/convert_currency_from_rub_to_USD amount some crap', from: {}, chat: {} });
    assert.equal(respText, 'Please send amount (number)\nFor example, /1 /10 /100 /1000');
    respText = '';
    user.handleMsg({ text: '0 some crap', from: {}, chat: {} });
    assert.equal(respText, '0 RUB is 0 USD');
  });

  it('should request amount, then handle the amount', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/convert_currency_from_rub_to_usd', from: {}, chat: {} });
    assert.equal(respText, 'Please send amount (number)\nFor example, /1 /10 /100 /1000');
    respText = '';
    user.handleMsg({ text: '0', from: {}, chat: {} });
    assert.equal(respText, '0 RUB is 0 USD');
  });
});
