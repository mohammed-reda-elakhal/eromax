# Ant Design Dark Theme Fix

This CSS file fixes all Ant Design components to work properly with dark mode across your entire project.

## How to Use

### Option 1: Import in your main App.js or index.js
```javascript
import './styles/ant-design-dark-theme.css';
```

### Option 2: Import in your main CSS file
```css
@import './ant-design-dark-theme.css';
```

### Option 3: Add to your HTML head (if using public folder)
```html
<link rel="stylesheet" href="/styles/ant-design-dark-theme.css">
```

## What it fixes

✅ **Select Components**: All select dropdowns, multi-select, select options, and cascader
✅ **Input Components**:
   - Text inputs, textareas, and input wrappers
   - Input with prefix/suffix icons
   - Input search components
   - Input password components
   - Input number components
   - Input OTP components
   - Input groups and addons
   - Auto-complete inputs
   - Mentions components
   - Disabled input states
✅ **Date Pickers**: Date range pickers, single date pickers, and calendar dropdowns
✅ **Form Components**: Form labels, required field indicators
✅ **Modal Components**: Modal backgrounds, headers, and content
✅ **Drawer Components**: Drawer backgrounds, headers, and content
✅ **Table Components**: Table headers, rows, and hover effects
✅ **Card Components**: Card backgrounds, headers, and borders
✅ **Upload Components**: File upload areas and lists
✅ **Divider Components**: Horizontal and vertical dividers
✅ **Tree Select**: Tree selection dropdowns and options

## Theme Detection

The CSS automatically detects your theme using:
- `[data-theme="dark"]` attribute
- `.dark-theme` class
- `body.dark-theme` class

Make sure your theme switching mechanism adds one of these to your HTML.

## Color Scheme

**Light Mode**: Clean whites and grays
**Dark Mode**: Professional slate colors (#1e293b, #334155, #e2e8f0)

All colors are designed to provide excellent contrast and readability in both themes.
