const core = require('./bot-prototype.js');

module.exports = token => Object.create(core).init(token);
