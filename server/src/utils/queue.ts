// Simple queue implementation to replace p-limit
let processing = false;
const queue: Array<() => Promise<any>> = [];

export const enqueue = async <T>(fn: () => Promise<T>): Promise<T> => {
  // If already processing, add to queue
  if (processing) {
    return new Promise<T>((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  // Otherwise process immediately
  processing = true;
  try {
    return await fn();
  } finally {
    // Process next item in queue if available
    if (queue.length > 0) {
      const next = queue.shift();
      if (next) next();
    } else {
      processing = false;
    }
  }
};