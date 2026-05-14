---
title: Proper Error Handling
impact: HIGH
category: correctness
tags: errors, exceptions, reliability
---

# Proper Error Handling

Always handle errors explicitly. Don't use bare except clauses or ignore errors silently. Provide helpful error messages.

## Why This Matters

Proper error handling:
- Prevents silent failures
- Aids debugging with clear messages
- Allows graceful degradation
- Improves user experience
- Enables error monitoring/alerting

## ❌ Incorrect

### Bare Except Clause
```python
# ❌ Catches everything, including KeyboardInterrupt, SystemExit
try:
    result = risky_operation()
except:
    pass  # Silent failure, no idea what went wrong
```

### Generic Exception Without Context
```python
# ❌ Too generic, loses error information
try:
    data = fetch_user(user_id)
    process(data)
    save_result()
except Exception:
    print("Error occurred")  # Which operation failed? Why?
```

### Ignoring Specific Errors
```python
# ❌ Ignoring errors entirely
try:
    config = json.loads(config_file.read())
except json.JSONDecodeError:
    pass  # App continues with undefined 'config'
```

## ✅ Correct

### Catch Specific Exceptions
```python
# ✅ Handle specific errors appropriately
try:
    config = json.loads(config_file.read())
except json.JSONDecodeError as e:
    logger.error(f"Invalid JSON in config file: {e}")
    config = get_default_config()
except FileNotFoundError:
    logger.warning("Config file not found, using defaults")
    config = get_default_config()
```

### Provide Context in Error Messages
```python
# ✅ Clear, actionable error messages
def get_user(user_id: int) -> User:
    try:
        response = requests.get(f"{API_URL}/users/{user_id}", timeout=5)
        response.raise_for_status()
        return User(**response.json())
    except requests.Timeout:
        raise ValueError(
            f"Timeout fetching user {user_id} from {API_URL}. "
            "Check network connection or increase timeout."
        )
    except requests.HTTPError as e:
        if e.response.status_code == 404:
            raise UserNotFoundError(f"User {user_id} does not exist")
        raise ValueError(f"HTTP error fetching user {user_id}: {e}")
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON response for user {user_id}")
```

## Best Practices

- [ ] **Catch specific exceptions** (not bare `except` or generic `Exception`)
- [ ] **Provide context** in error messages (what failed, why, how to fix)
- [ ] **Log errors** with relevant details
- [ ] **Don't silently ignore errors**
- [ ] **Use custom exception classes** for domain errors
- [ ] **Include stack traces** in logs (but not user-facing messages)
- [ ] **Handle errors at appropriate level** (don't catch too early)
- [ ] **Clean up resources** (use context managers/try-finally)
