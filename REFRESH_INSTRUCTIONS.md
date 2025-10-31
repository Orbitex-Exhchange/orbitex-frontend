# Frontend Refresh Instructions

## Issue
You're seeing an old version of the frontend instead of the latest changes.

## Quick Fix Steps

### 1. **Hard Refresh Browser** (Most Common Fix)
- **Mac**: `Cmd + Shift + R` or `Cmd + Option + R`
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- This clears the browser cache and forces a reload

### 2. **Clear Browser Cache Manually**
- Open Developer Tools (F12 or Cmd+Option+I)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

### 3. **Restart Dev Server**
The dev server has been stopped and `.next` cache cleared. Restart it:

```bash
cd frontend
npm run dev
```

### 4. **Check Your Branch**
Make sure you're on the correct branch:

```bash
git branch --show-current  # Should show: main
```

### 5. **Verify Uncommitted Changes**
The only uncommitted change is `src/lib/env.ts` (the environment variable fix we just made).

If you had other changes from last night, they might be:
- Uncommitted on a different branch
- Lost if not committed
- On the `dev` branch (which is behind `main`)

### 6. **Check for Stashed Changes**
```bash
git stash list
```

## Current State

**Branch**: `main`  
**Latest Commit**: `78f4d600` - "all frontend changes" (Oct 7, 2025)  
**Uncommitted Changes**: `src/lib/env.ts` (environment variable validation fix)

## If Still Not Working

1. **Check Browser Console** for errors
2. **Check Network Tab** to see what files are being loaded
3. **Verify Dev Server** is running on `http://localhost:3000`
4. **Check Environment Variables** in `.env.local` file

## Next Steps

1. Restart the dev server: `npm run dev`
2. Hard refresh your browser
3. Check if the latest changes appear
4. If needed, commit the `env.ts` changes:
   ```bash
   git add src/lib/env.ts
   git commit -m "fix: Handle empty strings in optional env vars"
   ```

