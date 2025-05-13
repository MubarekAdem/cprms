import { useState, useEffect } from "react";

export function useDelayedLoading(initialState = true, delay = 300) {
  const [isLoading, setIsLoading] = useState(initialState);

  useEffect(() => {
    let timer;
    if (initialState) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, delay);
    } else {
      setIsLoading(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [initialState, delay]);

  return isLoading;
}
