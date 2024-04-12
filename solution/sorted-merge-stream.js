const {Writable} = require('stream');

module.exports = class SortedMergeStream extends Writable {
  constructor() {
    super({objectMode: true});
    this.buffer = [];
  }

  _write(chunk, encoding, callback) {
    this.buffer.push(chunk);
    callback();
  }

  _final(callback) {
    // Sort the buffer
    this.buffer.sort((a, b) => a.date - b.date)

    // Emit each log entry for external consumption
    for (const logEntry of this.buffer) {
      this.emit('logEntry', logEntry)
    }

    // Signal the end of data
    this.emit('end');
    callback();
  }
}