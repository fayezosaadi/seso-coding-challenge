"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

const SortedMergeStream = require("./sorted-merge-stream");
const LogSourceStream = require("./async-log-source-stream");

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    const sortedMergeStream = new SortedMergeStream();

    const sourceStreams = logSources.map(logSource => new LogSourceStream(logSource))
    sortedMergeStream.setMaxListeners(logSources.length)
    sourceStreams.forEach(sourceStream => sourceStream.pipe(sortedMergeStream, {end: false}))

    const onFinish = () => {
      printer.done();
      console.log("Async sort complete.");
      resolve();
    }


    // Listen for logEntry events emitted by the sortedMergeStream
    sortedMergeStream.on('logEntry', (logEntry) => printer.print(logEntry));

    // Wait for all source streams to end
    await Promise.all(sourceStreams.map(sourceStream =>
      new Promise((resolve) => {
        sourceStream.on('end', resolve)
      })
    ));

    // Signal the end of data for the merge stream
    sortedMergeStream.end()

    sortedMergeStream.removeAllListeners('finish');
    sortedMergeStream.on('finish', onFinish);
  });
};
