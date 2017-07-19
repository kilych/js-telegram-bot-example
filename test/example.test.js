'use strict';

const assert = require('assert');
const userProt = require('../src/user-prototype.js');
const bot = require('../example/example.js')();

describe('TEST: example convert currency command', () => {
  let user = Object.create(userProt).init(bot.actions);

  it('should request command', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/convert', from: {}, chat: {}});
    assert.equal(respText, 'Please send command\n/currency');
  });

  it('should request command', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: ' some crap ', from: {}, chat: {}});
    assert.equal(respText, 'Please send command\n/currency');
  });

  it('should request "from" currency', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: 'currency', from: {}, chat: {}});
    assert.equal(respText, 'Please send "from" currency (three letter code)');
  });

  it('should request "from" currency', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: 'some crap', from: {}, chat: {}});
    assert.equal(respText, 'Please send "from" currency (three letter code)');
  });

  it('should request "to" currency', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: 'usd', from: {}, chat: {}});
    assert.equal(respText, 'Please send "to" currency (three letter code)');
  });

  it('should request "to" currency', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: 'some crap', from: {}, chat: {}});
    assert.equal(respText, 'Please send "to" currency (three letter code)');
  });

  it('should request amount', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: 'rub some crap', from: {}, chat: {}});
    assert.equal(respText, 'Please send amount (number)');
  });

  it('should request amount', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: 'some crap ', from: {}, chat: {}});
    assert.equal(respText, 'Please send amount (number)');
  });

  it('should response "0 rub is 0 usd" and clean state (end of dialog)', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '0.0', from: {}, chat: {}});
    assert.equal(user.state.stack.length, 0);
    assert.equal(respText, '0 usd is 0 rub');
  });

  it('should response "0 rub is 0 usd" and clean state', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/convert_currency_amount_0_from_rub_to_usd', from: {}, chat: {}});
    assert.equal(user.state.stack.length, 0);
    assert.equal(respText, '0 rub is 0 usd');
  });

  it('should request amount, then handle the amount', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/convert_currency_from_rub_to_usd amount some crap', from: {}, chat: {}});
    assert.equal(respText, 'Please send amount (number)');
    respText = '';
    user.handleMsg({text:'0 some crap', from: {}, chat: {}});
    assert.equal(respText, '0 rub is 0 usd');
  });

  it('should request amount, then handle the amount', () => {
    let respText = '';
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/convert_currency_from_rub_to_usd', from: {}, chat: {}});
    assert.equal(respText, 'Please send amount (number)');
    respText = '';
    user.handleMsg({text:'0', from: {}, chat: {}});
    assert.equal(respText, '0 rub is 0 usd');
  });
});
