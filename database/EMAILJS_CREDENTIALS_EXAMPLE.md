# EmailJS Credentials Example

## Your Service ID (from EmailJS Dashboard)
Based on your screenshot, your Service ID appears to be:
```
service_htdxvdn
```

**Note:** Use the exact Service ID you see in your EmailJS dashboard after creating the service.

## Where to Update in Code:

### Patient Settings:
**File:** `components/patient/sections/settings/settings-standalone.html`
**Line:** ~1502

Replace:
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
```

With:
```javascript
const EMAILJS_SERVICE_ID = 'service_htdxvdn'; // Your actual Service ID
```

### Dentist Settings:
**File:** `components/dentist/sections/settings/settings-standalone.html`
**Line:** ~1671

Replace:
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
```

With:
```javascript
const EMAILJS_SERVICE_ID = 'service_htdxvdn'; // Your actual Service ID
```

## What You Still Need:

1. **Template ID** - Create Email Template in EmailJS dashboard
2. **Public Key** - Get from Account → General in EmailJS dashboard

## Complete Example:

After getting all credentials, your code should look like:

```javascript
const EMAILJS_SERVICE_ID = 'service_htdxvdn'; // Your Service ID
const EMAILJS_TEMPLATE_ID = 'template_abc123'; // Your Template ID (get from EmailJS)
const EMAILJS_PUBLIC_KEY = 'abcdefghijklmnop'; // Your Public Key (get from EmailJS)
```

**Note:** Replace `template_abc123` and `abcdefghijklmnop` with your actual values from EmailJS dashboard.

