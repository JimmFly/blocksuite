import { GeneralNetworkError } from '@blocksuite/blocks';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// do we really need to export this?
export function toTextStream(
  eventSource: EventSource,
  options: {
    timeout?: number;
    type?: 'attachment' | 'message';
  } = {}
): BlockSuitePresets.TextStream {
  const { timeout, type = 'message' } = options;
  return {
    [Symbol.asyncIterator]: async function* () {
      const messageQueue: string[] = [];
      let resolveMessagePromise: () => void;
      let rejectMessagePromise: (err: Error) => void;

      function resetMessagePromise() {
        if (resolveMessagePromise) {
          resolveMessagePromise();
        }
        return new Promise<void>((resolve, reject) => {
          resolveMessagePromise = resolve;
          rejectMessagePromise = reject;
        });
      }
      let messagePromise = resetMessagePromise();
      eventSource.addEventListener(type, event => {
        messageQueue.push(event.data);
        messagePromise = resetMessagePromise();
      });

      eventSource.onerror = err => {
        if (err?.type === 'error') {
          rejectMessagePromise(new GeneralNetworkError());
        } else {
          resolveMessagePromise();
        }
        eventSource.close();
      };

      try {
        while (eventSource.readyState !== EventSource.CLOSED) {
          if (messageQueue.length === 0) {
            // Wait for the next message or timeout
            await (timeout
              ? Promise.race([
                  messagePromise,
                  delay(timeout).then(() => {
                    throw new Error('Timeout');
                  }),
                ])
              : messagePromise);
          } else if (messageQueue.length > 0) {
            yield messageQueue.shift()!; // Yield the next message
          }
        }
      } finally {
        eventSource.close();
      }
    },
  };
}
