'use strict';

const core = require(__dirname + '/bot-prototype.js');

module.exports = token => {
    let bot = Object.create(core).init(token);

    return bot;
};
