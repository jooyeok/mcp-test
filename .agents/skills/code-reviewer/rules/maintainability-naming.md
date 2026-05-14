---
title: Use Meaningful Variable Names
impact: MEDIUM
category: maintainability
tags: naming, readability, code-quality
---

# Use Meaningful Variable Names

Choose descriptive, intention-revealing names. Avoid single letters (except loop counters), abbreviations, and generic names.

## Why This Matters

Code is read 10x more than it's written. Clear names:
- Make code self-documenting
- Reduce cognitive load
- Prevent bugs from misunderstanding
- Enable easier refactoring

## ❌ Incorrect

```python
# ❌ Cryptic, meaningless
def calc(x, y, z):
    tmp = x * y
    res = tmp + z
    return res
```

## ✅ Correct

```python
# ✅ Clear, descriptive
def calculate_total_price(item_price: float, quantity: int, tax_rate: float) -> float:
    subtotal = item_price * quantity
    total_with_tax = subtotal + (subtotal * tax_rate)
    return total_with_tax
```

## References

- [PEP 8 - Python Naming Conventions](https://peps.python.org/pep-0008/#naming-conventions)
- [Clean Code by Robert Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
