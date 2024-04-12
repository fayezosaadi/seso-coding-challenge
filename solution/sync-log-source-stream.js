const {Readable} = require('stream');

/**
 * LogSourceStream class represents a readable stream that reads log entries from a log source
 * and emits them for external consumption. It supports synchronous reading of log entries.
 *
 * **/
module.exports = class LogSourceStream extends Readable {
  constructor(logSource) {
    super({objectMode: true});
    this.logSource = logSource;
  }

  // Implement the _read method to synchronously read log entries from the log source
  _read(size) {
    const logEntry = this.logSource.pop();
    if (!logEntry) {
      this.push(null); // End of log source
    } else {
      this.push(logEntry);
    }
  }
}