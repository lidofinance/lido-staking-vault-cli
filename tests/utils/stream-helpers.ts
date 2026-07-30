// Build a ReadableStream response body from bytes, chunked so tests exercise
// multi-read streaming. Default chunk keeps small payloads a single read.
export const streamOf = (bytes: Uint8Array, chunkSize = 64 * 1024) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += chunkSize) {
        controller.enqueue(bytes.slice(i, i + chunkSize));
      }
      controller.close();
    },
  });
