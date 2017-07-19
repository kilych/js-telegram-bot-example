'use strict';

module.exports = {
  init(stack = [], updatingEnabled = true) {
    this.stack = stack;
	  this.updatingEnabled = updatingEnabled;
    return this;
  },

  isEmpty() { return this.stack.length === 0; },

	push(state) {
		this.stack.push(state);
    return this;
	},

	pop() {
		if (!this.isEmpty()) this.stack.pop();
		return this;
	},

  swap(state) {
    if (!this.isEmpty()) this.pop().push(state);
  },

	get() {
		if (this.isEmpty()) return false;
    return this.stack[this.stack.length - 1];
	},

  clean() {
    this.stack = [];
    return this;
  },

	update() {
		const state = this.get();
		if (!this.updatingEnabled || state === false) return false;
    if (typeof state !== 'function') {
      throw new Error(`in function update: Unexpected type of state: \
expected function, but ${typeof state} given.`);
    }
    state();
    return true;
	},

  // maybe just get???
	updateNoRun() {
		const state = this.get();
		if (this.updatingEnabled && state !== false) return state;
    return false;
	},

	enableUpdating() {
		this.updatingEnabled = true;
	},

	disableUpdating() {
		this.updatingEnabled = false;
	}
};
