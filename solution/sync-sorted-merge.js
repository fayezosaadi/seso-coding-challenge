"use strict";

// Print all entries, across all of the sources, in chronological order.

const SortedMergeStream = require("./sorted-merge-stream");
const LogSourceStream = require("./sync-log-source-stream");

module.exports = (logSources, printer) => {
  const sortedMergeStream = new SortedMergeStream()

  // Create source streams for each log source
  const sourceStreams = logSources.map(logSource => new LogSourceStream(logSource))
  // Set the maximum number of listeners for the merge stream and print log entries
  sortedMergeStream.setMaxListeners(logSources.length)
  // Pipe each source log to the merge stream
  sourceStreams.forEach(sourceStream => sourceStream.pipe(sortedMergeStream))

  // Listen for logEntry events emitted by the sortedMergeStream
  sortedMergeStream.on('logEntry', logEntry => printer.print(logEntry));

  // Function to be called when the merge stream finishes
  const onFinish = () => {
    // Get stats for the solution
    printer.done()
    return console.log("Sync sort complete.")
  }

  // Remove any existing 'finish' event listeners and add a new listener to execute the onFinish function once
  sortedMergeStream.removeAllListeners('finish')
  sortedMergeStream.once('finish', onFinish)
};
