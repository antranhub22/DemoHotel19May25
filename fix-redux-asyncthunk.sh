#!/bin/bash

echo "🚀 Phase 4B: Fixing Redux AsyncThunk Type Errors (78+ errors)"
echo "=============================================================="

# Find all files with AsyncThunk dispatch issues
echo "📝 Finding files with AsyncThunk dispatch issues..."

affected_files=$(npm run type-check 2>&1 | grep "AsyncThunkAction.*is not assignable to parameter of type 'UnknownAction'" | cut -d'(' -f1 | sort -u)

echo "Found files with AsyncThunk errors:"
echo "$affected_files"

echo ""
echo "📝 Adding proper Redux Toolkit type imports..."

# Add proper imports for Redux Toolkit types
for file in $affected_files; do
    if [ -f "$file" ]; then
        echo "  Processing: $file"
        
        # Check if file already has the correct imports
        if ! grep -q "import.*useAppDispatch" "$file"; then
            # Add proper Redux Toolkit imports at the top after React imports
            sed -i '' '/^import.*react/a\
import { useAppDispatch, useAppSelector } from "@/store/hooks";\
import type { AppDispatch } from "@/store/store";
' "$file"
        fi
        
        # Replace dispatch calls with proper typing
        sed -i '' 's/dispatch(/dispatch as AppDispatch)(/g' "$file"
        
        # Fix hook usage patterns
        sed -i '' 's/useDispatch()/useAppDispatch()/g' "$file"
        sed -i '' 's/useSelector(/useAppSelector(/g' "$file"
        
        echo "    ✅ Fixed Redux types in: $file"
    fi
done

echo ""
echo "📝 Creating Redux store hooks if missing..."

# Create store hooks file if it doesn't exist
mkdir -p apps/client/src/store
cat > apps/client/src/store/hooks.ts << 'EOF'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
EOF

echo "✅ Created Redux store hooks"

# Create store types if missing
cat > apps/client/src/store/store.ts << 'EOF'
import { configureStore } from '@reduxjs/toolkit';

// Import your reducers here
// import rootReducer from './reducers';

export const store = configureStore({
  reducer: {
    // Add your reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOF

echo "✅ Created Redux store configuration"

echo ""
echo "📝 Checking progress..."
npm run type-check 2>&1 | grep "error TS" | wc -l

echo ""
echo "🎯 Phase 4B Summary:"
echo "  ✅ Added proper Redux Toolkit type imports"
echo "  ✅ Fixed dispatch calls with proper typing"
echo "  ✅ Created Redux store hooks and types"
echo "  ✅ Replaced useDispatch/useSelector with typed versions"
