---
title: "实用的自定义 Hooks"
sidebar_position: 4
---

# 倒计时
```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  seconds: number;
  onComplete?: () => void;
}

interface UseCountdownReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const useCountdown = ({ seconds, onComplete }: UseCountdownOptions): UseCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, isRunning, onComplete]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [seconds]);

  return { timeLeft, isRunning, start, pause, reset };
};

export default useCountdown;

// 使用示例：
// const { timeLeft, isRunning, start, pause, reset } = useCountdown({ seconds: 60, onComplete: () => console.log('完成') });
// return <div>倒计时：{timeLeft} 秒</div>;
```

# 首次加载不更新
```typescript
//`useUpdateEffect` 用法等同于 `useEffect`，但是会忽略首次执行，只在依赖更新时执行。
import { useRef, useEffect } from "react";

const useUpdateEffect = (hook) => (effect, deps) => {
  const isMounted = useRef(false);

  hook(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  hook(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};

export default useUpdateEffect(useEffect);
```

# 下拉加载
```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseLoadMoreOptions {
  onLoadMore: () => Promise<void> | void;
  threshold?: number; // 距离底部多少像素时触发，默认100
}

interface UseLoadMoreReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const useLoadMore = ({ onLoadMore, threshold = 100 }: UseLoadMoreOptions): UseLoadMoreReturn => {
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(() => {
    if (loading) return;
    const scrollBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    if (scrollBottom <= threshold) {
      setLoading(true);
      Promise.resolve(onLoadMore()).finally(() => {
        setLoading(false);
      });
    }
  }, [loading, onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { loading, setLoading };
};

export default useLoadMore;

// 使用示例：
// const { loading } = useLoadMore({ onLoadMore: async () => { await fetchMoreData(); } });
// return <div>{loading && <p>Loading...</p>}</div>;
```

# 防抖
```typescript
import { useCallback, useRef } from 'react';

function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number = 300) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = useCallback((...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { run: debouncedFn, cancel };
}

export default useDebounce;

// 使用示例：
// const { run: handleSearch, cancel } = useDebounce((value: string) => fetchSearchResults(value), 500);
// <input onChange={e => handleSearch(e.target.value)} />
```

# 节流
```typescript
import { useCallback, useRef } from 'react';

function useThrottle<T extends (...args: any[]) => any>(fn: T, delay: number = 300) {
  const lastTimeRef = useRef(0);

  const throttledFn = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTimeRef.current >= delay) {
      fn(...args);
      lastTimeRef.current = now;
    }
  }, [fn, delay]);

  return throttledFn;
}

export default useThrottle;

// 使用示例：
// const handleScroll = useThrottle(() => console.log('scrolling'), 200);
// useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
```

# 本地存储
```typescript
import { useState, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

export default useLocalStorage;

// 使用示例：
// const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
```

# 获取前一个值
```typescript
import { useRef, useEffect } from 'react';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default usePrevious;

// 使用示例：
// const [count, setCount] = useState(0);
// const prevCount = usePrevious(count);
// return <div>现在: {count}, 之前: {prevCount}</div>;
```

# 媒体查询
```typescript
import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default useMediaQuery;

// 使用示例：
// const isMobile = useMediaQuery('(max-width: 768px)');
// const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
```
