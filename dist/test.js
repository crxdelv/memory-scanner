try {
  console.info(`[1]: Importing memory-scanner...`);
  const MemoryScanner = require("memory-scanner");
  const version = MemoryScanner.version;
  console.info(`[/]: Imported memory-scanner (v${version})`);
  console.info("[=]: Test passed");
} catch(e) {
  console.error(e);
  console.error("[=]: Test failed");
}