var Readable = require('stream').Readable;
var inherits = require('util').inherits;
const event = require('./event');

/**
 * Returns a new subscription event event.
 * Real APIs would care about the `event`.
 */

exports.subscribe = function(event, options) {
  return Subscription(options);
};

/**
 * Subscription stream. Just increments the result.
 * Never ends!
 */

inherits(Subscription, Readable);

function Subscription(options) {
  if (!(this instanceof Subscription)) return new Subscription(options);

  options = options || {};
  Readable.call(this, options);

  this.value = 0;
  setInterval(() => {
    this.push(String(this.value++));
  }, 1000);
}

Subscription.prototype._read = function() {
  // while (this.push(String(this.value++))) {}
};
