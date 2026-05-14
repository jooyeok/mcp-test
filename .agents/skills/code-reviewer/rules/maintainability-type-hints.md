---
title: Add Type Hints
impact: MEDIUM
category: maintainability
tags: types, python, typescript, type-safety
---

# Add Type Hints

Use type annotations to make code self-documenting and catch errors early.

## Why This Matters

Type hints provide:
- **Static analysis** - catch bugs before runtime
- **Better IDE support** - autocomplete, refactoring
- **Documentation** - types explain intent
- **Confidence** - easier refactoring

## ❌ Incorrect

```python
# ❌ No type hints
def get_user(id):
    return users.get(id)
```

## ✅ Correct

```python
# ✅ Full type hints
from typing import Optional, Dict, Any

def get_user(id: int) -> Optional[Dict[str, Any]]:
    return users.get(id)
```

## References

- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
