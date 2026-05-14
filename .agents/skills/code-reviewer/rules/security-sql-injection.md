---
title: SQL Injection Prevention
impact: CRITICAL
category: security
tags: sql, security, injection, database
---

# SQL Injection Prevention

Never construct SQL queries with string concatenation or f-strings. Always use parameterized queries.

## ❌ Incorrect

```python
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    result = db.execute(query)
    return result
```

## ✅ Correct

```python
def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    query = "SELECT * FROM users WHERE id = ?"
    result = db.execute(query, (user_id,))
    return result.fetchone() if result else None
```

## References

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
