# 🔄 Fix React Infinite Render Warning

## ⚠️ **Vấn đề:**

```
Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

## 🔍 **Nguyên nhân phổ biến:**

### 1. **useEffect không có dependencies**

```javascript
// ❌ BAD - causes infinite render
useEffect(() => {
  setUser(someValue);
}); // No dependency array

// ✅ GOOD - proper dependencies
useEffect(() => {
  setUser(someValue);
}, [someValue]); // With dependencies
```

### 2. **setState trong render function**

```javascript
// ❌ BAD - setState in render
const Component = () => {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Called every render!
  return <div>{count}</div>;
};

// ✅ GOOD - setState in useEffect or event handler
const Component = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(1);
  }, []); // Only on mount

  return <div>{count}</div>;
};
```

### 3. **Object dependencies changing every render**

```javascript
// ❌ BAD - object recreated every render
const Component = () => {
  const config = { api: "url" }; // New object every render

  useEffect(() => {
    fetchData(config);
  }, [config]); // Runs every render!
};

// ✅ GOOD - stable dependencies
const Component = () => {
  const config = useMemo(() => ({ api: "url" }), []);

  useEffect(() => {
    fetchData(config);
  }, [config]); // Runs only when needed
};
```

## 🎯 **Fixes cho Hotel Voice Assistant:**

### 1. **AuthContext.tsx fixes:**

```javascript
// ❌ Potential issue
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    setUser(decodeToken(token));
  }
}); // No dependencies - runs every render!

// ✅ Fixed version
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    setUser(decodeToken(token));
  }
}, []); // Empty dependency - runs only on mount
```

### 2. **VoiceAssistant.tsx fixes:**

```javascript
// ❌ Potential issue
const Component = () => {
  const [vapiInstance, setVapiInstance] = useState(null);

  useEffect(() => {
    if (!vapiInstance) {
      initVapi().then(setVapiInstance);
    }
  }, [vapiInstance]); // Can cause infinite loop if initVapi always returns new object
};

// ✅ Fixed version
const Component = () => {
  const [vapiInstance, setVapiInstance] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      initVapi().then(setVapiInstance);
    }
  }, [isInitialized]); // Controlled by boolean flag
};
```

### 3. **API calling patterns:**

```javascript
// ❌ Can cause infinite requests
const Component = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((response) => response.json())
      .then(setData);
  }, [data]); // Re-runs when data changes!
};

// ✅ Fixed version
const Component = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading && !data) {
      setLoading(true);
      fetch("/api/data")
        .then((response) => response.json())
        .then((result) => {
          setData(result);
          setLoading(false);
        });
    }
  }, [data, loading]); // Controlled execution
};
```

## 🔧 **Specific files to check:**

### 1. `apps/client/src/context/AuthContext.tsx`

- Check `useEffect` dependencies trong authentication logic
- Ensure token decode không trigger re-render

### 2. `apps/client/src/components/VoiceAssistant.tsx`

- Check Vapi initialization logic
- Verify event listeners không re-attach mỗi render

### 3. `apps/client/src/pages/unified-dashboard/CustomerRequests.tsx`

- Check `fetchRequests` function dependencies
- Verify `useEffect` cho data fetching

## 🛠️ **Quick debugging:**

### 1. **Add console.log to identify culprit:**

```javascript
useEffect(() => {
  console.log("Effect running!", { dependency1, dependency2 });
  // Your effect code
}, [dependency1, dependency2]);
```

### 2. **Use React DevTools Profiler:**

- Open React DevTools
- Go to Profiler tab
- Record during the warning
- Look for components re-rendering rapidly

### 3. **Add useCallback/useMemo where needed:**

```javascript
// For functions
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// For objects/arrays
const memoizedValue = useMemo(() => {
  return { api: "url", config: settings };
}, [settings]);
```

## ✅ **Testing the fix:**

1. **Open browser console trên production**
2. **Look for the warning message**
3. **Apply fixes to identified components**
4. **Verify warnings stop appearing**

## 📋 **Common patterns in Hotel app:**

```javascript
// Auth token checking (common issue)
useEffect(() => {
  const checkAuth = async () => {
    const token = await getAuthToken();
    if (token && !isTokenExpired(token)) {
      setUser(decodeToken(token));
    }
  };
  checkAuth();
}, []); // Run only on mount, not on every user change

// API data fetching (common issue)
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const response = await authenticatedFetch("/api/requests");
      const data = await response.json();
      if (isMounted) {
        setRequests(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error.message);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false; // Cleanup flag
  };
}, []); // Empty dependency array for initial load only
```

**🎯 Most likely fix: Check AuthContext.tsx and VoiceAssistant.tsx useEffect dependencies!**
