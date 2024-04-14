"use strict";

const {MinPriorityQueue} = require("@datastructures-js/priority-queue")
const EventEmitter = require('node:events');

module.exports = class LogEntryQueue {
  #queue
  #logSources
  #eventEmitter
  #bufferSize
  #logSourcesBatches
  #isBatchReady
  #hasDrained

  async #pushNext(logSource, logSourceId) {
    const logEntry = await logSource.popAsync()
    if (logEntry) this.#queue.push({logEntry, logSourceId})
    else this.#hasDrained[logSourceId] = true

  }

  async #fillBatch(logSourceId) {
    const batch = []
    for (let i = 0; i < this.#bufferSize; i++) {
      const logEntry = await this.#logSources[logSourceId].popAsync()
      if (logEntry) batch.push({logEntry, logSourceId})
      else {
        this.#hasDrained[logSourceId] = true
        break
      }
    }
    return batch

  }

  #initBatchProcessing(logSourceId) {
    this.#eventEmitter.emit('batch', logSourceId)

  }

  // Check batch size and trigger refill if necessary
  #checkBatchSize(logSourceId) {
    const streamBatch = this.#logSourcesBatches[logSourceId];
    if (!streamBatch.length) this.#initBatchProcessing(logSourceId)

  }

  #waitForBatchReady(logSourceId) {
    return new Promise(resolve => {
      const checkBatchReady = () => {
        if (this.#isBatchReady[logSourceId]) resolve()
        else setTimeout(checkBatchReady, 1)
      }
      checkBatchReady()
    })
  }

  constructor(logSources) {
    this.#queue = new MinPriorityQueue((a) => a.logEntry.date)
    this.#logSources = logSources
    this.#eventEmitter = new EventEmitter()
    this.#bufferSize = 900
    this.#logSourcesBatches = {}
    this.#isBatchReady = {}
    this.#hasDrained = {}

    this.#eventEmitter.on('batch', async (logSourceId) => {
      if (!this.#hasDrained[logSourceId]) {
        this.#isBatchReady[logSourceId] = false
        this.#logSourcesBatches[logSourceId] = await this.#fillBatch(logSourceId)
        this.#isBatchReady[logSourceId] = true
      }
    })

  }

  async init() {
    // Initialize log sources and push their first entries onto the priority queue
    await Promise.all(this.#logSources.map(async (source, index) => this.#pushNext(source, index)))

    // Initialize log sources batches
    for (let index = 0; index < this.#logSources.length; index++) {
      this.#initBatchProcessing(index)
    }

  }

  async dequeue() {
    if (this.#queue.isEmpty()) return false

    const {logEntry, logSourceId} = this.#queue.dequeue()
    await this.#waitForBatchReady(logSourceId)
    const streamBatch = this.#logSourcesBatches[logSourceId]

    if (streamBatch.length) {
      const newLogEntry = streamBatch.shift()
      this.#logSourcesBatches[logSourceId] = streamBatch
      this.#queue.push(newLogEntry)
    }

    this.#checkBatchSize(logSourceId)
    return logEntry

  }

}