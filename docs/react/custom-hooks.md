---
title: "实用的自定义 Hooks"
sidebar_position: 4
---

# 倒计时
```typescript
import React, { useState, useEffect } from 'react';

const useCountdown = ({ seconds }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  return (
    <div>
      <h2>倒计时：{timeLeft} 秒</h2>
    </div>
  );
};

export default useCountdown;

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
import React, { useState, useEffect } from 'react';

const useLoadMore = ({ onLoadMore }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight && !loading) {
        setLoading(true);
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, onLoadMore]);

  return (
    <div>
      {loading ? <p>Loading...</p> : null}
    </div>
  );
};

export default useLoadMore;
```

