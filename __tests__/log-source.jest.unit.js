const LogSource = require("../lib/log-source");
const Printer = require("../lib/printer");

// Mock log entries for testing
const logEntries = [
  {date: new Date('2022-01-01'), msg: 'First log entry'},
  {date: new Date('2022-01-02'), msg: 'Second log entry'},
  {date: new Date('2022-01-03'), msg: 'Third log entry'}
];

describe("Log Source Behaviors", () => {
  test("It should synchronously drain a log source", () => {
    const source = new LogSource();
    let entry = source.pop();
    expect(new Date() > entry.date).toBeTruthy();
    expect(entry.msg).toBeTruthy();
    entry = source.pop();
    expect(new Date() > entry.date).toBeTruthy();
    expect(entry.msg).toBeTruthy();
    source.last.date = new Date();
    entry = source.pop();
    expect(entry).toBeFalsy();
  });

  test("It should asynchronously drain a log source", async () => {
    const source = new LogSource();
    let entry = await source.popAsync();
    expect(new Date() > entry.date).toBeTruthy();
    expect(entry.msg).toBeTruthy();
    entry = await source.popAsync();
    expect(new Date() > entry.date).toBeTruthy();
    expect(entry.msg).toBeTruthy();
    source.last.date = new Date();
    entry = await source.popAsync();
    expect(entry).toBeFalsy();
  });

  test("", async () => {
    // Mock log source with async pop method
    const logSource = {
      async popAsync() {
        return logEntries.shift(); // Simulate popping log entries asynchronously
      }
    };

    // Mock printer object
    const printer = {
      printedEntries: [],
      print(logEntry) {
        this.printedEntries.push(logEntry); // Record printed log entries
      },
      done() {
      } // Mock done method
    };

    // Execute the async log draining function with the mock log source and printer
    await require("../solution/async-sorted-merge")([logSource], printer)

    // Ensure that the printed log entries are in chronological order
    for (let i = 1; i < printer.printedEntries.length; i++) {
      expect(printer.printedEntries[i].date > printer.printedEntries[i - 1].date).toBeTruthy();
    }
  });
});
