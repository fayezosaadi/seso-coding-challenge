"use strict";

const {MinPriorityQueue} = require("@datastructures-js/priority-queue");

module.exports = class LogEntryQueue {
  #queue
  #logSources

  constructor(logSources) {
    this.#queue = new MinPriorityQueue((a) => a.logEntry.date)
    this.#logSources = logSources
  }

  init() {
    for (const [sourceIndex, logSource] of this.#logSources.entries()) {
      const logEntry = logSource.pop()
      if (logEntry) this.#queue.push({logEntry, sourceIndex})
    }
  }

  dequeue() {
    if (this.#queue.isEmpty()) return false

    const {logEntry, sourceIndex} = this.#queue.dequeue()
    const logSource = this.#logSources [sourceIndex]
    const nextLogEntry = logSource.pop()
    if (nextLogEntry) this.#queue.push({logEntry: nextLogEntry, sourceIndex})

    return logEntry
  }

}
