---
title: XSS Prevention
impact: CRITICAL
category: security
tags: xss, security, html, javascript
---

# Cross-Site Scripting (XSS) Prevention

Never insert unsanitized user input into HTML.

## ❌ Incorrect

```javascript
// Dangerous!
document.getElementById('username').innerHTML = userInput;
```

## ✅ Correct

```javascript
// Safe: use textContent
element.textContent = userInput;

// Or sanitize if HTML needed
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userHtml);
```

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
