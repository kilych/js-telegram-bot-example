const core = require('./bot-prototype');

module.exports = token => Object.create(core).init(token);
