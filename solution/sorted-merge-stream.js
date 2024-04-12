const {Writable} = require('stream');

/**
 * SortedMergeStream class represents a writable stream that buffers and sorts log entries
 * before emitting them for external consumption. It ensures that log entries are emitted
 * in chronological order.
 *
 * **/
module.exports = class SortedMergeStream extends Writable {
  constructor() {
    super({objectMode: true});

    // Initialize an empty buffer to store log entries
    this.buffer = [];
  }

  _write(chunk, encoding, callback) {
    this.buffer.push(chunk);
    // Signal that the write operation is complete
    callback();
  }

  _final(callback) {
    // Sort the buffer in ascending order based on the date property of each log entry
    this.buffer.sort((a, b) => a.date - b.date)

    // Emit each log entry for external consumption
    for (const logEntry of this.buffer) {
      this.emit('logEntry', logEntry)
    }

    // Signal the end of data
    this.emit('end');

    // Signal that the final operation is complete
    callback();
  }
}