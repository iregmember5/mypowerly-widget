# Widget Migration Summary

## What Was Done

### 1. New Widget Project Setup
- **Location**: `C:\Users\Administrator\Desktop\mypowerly widget\mypowerly-widget`
- **Created Files**:
  - `src/W9Widget.jsx` - The main widget component
  - `public/w9-widget/widget.js` - The embed script
  - `src/App.jsx` - Updated to render W9Widget

### 2. Widget.js Changes
**File**: `public/w9-widget/widget.js`

**Key Changes**:
```javascript
// OLD (dynamic URL based on current site):
const scriptSrc = document.currentScript?.src || document.querySelector('script[src*="widget.js"]')?.src;
const frontendUrl = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;

// NEW (static URL):
const widgetUrl = 'http://localhost:5174';
```

**Backend URL**: Remains static at `https://esign-admin.signmary.com`

### 3. What Needs to Be Updated in W9Chaser.tsx

You need to find where the embed code is generated (likely in VendorRequestPage.tsx or a similar component) and update it to use:

**Widget Script URL**: 
```html
<script src="http://localhost:5174/w9-widget/widget.js"></script>
```

**Backend API URL**: 
```javascript
apiUrl: 'https://esign-admin.signmary.com'
```

## Example Embed Code (What Users Will Copy)

```html
<script>
  window.PowerlyWidget = {
    id: 'YOUR_WORKSPACE_ID',
    apiUrl: 'https://esign-admin.signmary.com'
  };
</script>
<script src="http://localhost:5174/w9-widget/widget.js"></script>
```

## Next Steps

1. **Start the Widget Server**:
   ```bash
   cd "C:\Users\Administrator\Desktop\mypowerly widget\mypowerly-widget"
   npm install
   npm run dev
   ```
   This should start on `http://localhost:5174`

2. **Find Embed Code Generation**:
   - Search for where embed code is generated in your main app
   - Look in `VendorRequestPage.tsx` or similar components
   - Update the script src to: `http://localhost:5174/w9-widget/widget.js`
   - Ensure apiUrl is set to: `https://esign-admin.signmary.com`

3. **For Production**:
   - Replace `http://localhost:5174` with your production widget URL
   - Keep backend URL as `https://esign-admin.signmary.com` (or update to production backend)

## Benefits

✅ Widget loads independently from main website
✅ Faster load times (no need to load entire main app)
✅ Static URLs make it easier to manage
✅ Widget can be deployed separately from main app

## Testing

1. Start the widget server on localhost:5174
2. Create a test HTML file with the embed code
3. Open it in a browser to verify the widget loads correctly
4. Test all widget functionality (form submission, validation, etc.)
