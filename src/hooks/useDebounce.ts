import { useCallback, useEffect, useRef } from "react";

import { type DebouncedFunc } from "lodash";
import debounce from "lodash/debounce";

const useDebounce = <R, A extends unknown[]>(
  callback: (...args: A) => R,
  delay: number,
  dependencies?: unknown[],
) => {
  const debouncedFn = useRef<DebouncedFunc<(...args: A) => R>>();

  useEffect(() => {
    debouncedFn.current = debounce(callback, delay);

    return () => {
      debouncedFn.current?.cancel?.();
    };
  }, [delay, ...(dependencies ?? [])]);

  return useCallback((...args: A) => {
    debouncedFn.current?.(...args);
  }, []);
};

export { useDebounce };
