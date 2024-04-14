"use strict";

const LogEntryQueue = require("./sync-log-queue")

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {

  const logEntryQueue = new LogEntryQueue(logSources)
  logEntryQueue.init()

  let logEntry = logEntryQueue.dequeue()
  while (logEntry) {
    printer.print(logEntry)
    logEntry = logEntryQueue.dequeue()
  }

  printer.done()
  return console.log("Sync sort complete")
}
