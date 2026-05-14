---
title: Avoid N+1 Query Problem
impact: HIGH
category: performance
tags: database, performance, orm, queries
---

# Avoid N+1 Query Problem

The N+1 query problem occurs when code executes 1 query to fetch a list, then N additional queries to fetch related data for each item.

## Why This Matters

- **10 items** → 11 queries
- **100 items** → 101 queries
- **1000 items** → 1001 queries

## ❌ Incorrect

```python
# ❌ N+1 queries
posts = Post.objects.all()  # 1 query
for post in posts:
    print(f"{post.title} by {post.author.name}")  # N queries
```

## ✅ Correct

```python
# ✅ 1 query with JOIN
posts = Post.objects.select_related('author').all()
for post in posts:
    print(f"{post.title} by {post.author.name}")  # No extra queries!
```

## References

- [Django select_related/prefetch_related](https://docs.djangoproject.com/en/stable/ref/models/querysets/#select-related)
- [Sequelize Eager Loading](https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/)
