const executePromisesBatch = async <T>(
  promises: (() => Promise<T>)[],
  batchSize: number,
) => {
  const results: T[] = [];
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((p) => p()));
    results.push(...batchResults);
  }

  return results;
};

const executeSerial = async <T>(promises: (() => Promise<T>)[]) => {
  const results: T[] = [];
  for (const promise of promises) {
    const result = await promise();
    results.push(result);
  }
};

export { executeSerial, executePromisesBatch };
