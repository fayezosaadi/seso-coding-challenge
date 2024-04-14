"use strict";

const LogEntryQueue = require("./async-log-queue")

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {

    const logEntryQueue = new LogEntryQueue(logSources)
    await logEntryQueue.init()

    let logEntry = await logEntryQueue.dequeue()
    while (logEntry) {
      printer.print(logEntry)
      logEntry = await logEntryQueue.dequeue()
    }

    printer.done()
    console.log("Async sort complete.")
  })
}
