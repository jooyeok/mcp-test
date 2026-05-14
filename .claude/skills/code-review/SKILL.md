---
name: code-review
description: This skill should be used when the user asks to "review code", "review my changes", "review this file", "code review", "리뷰해줘", "코드 리뷰", or supplies a PR number with a review request. Also invoke when the user says "check my code" or "look at my diff".
version: 1.0.0
user-invocable: true
argument-hint: [file | PR#]
allowed-tools: [Read, Glob, Grep, Bash]
---

# Code Review Skill

## Overview
Automatically review code changes in the current repository and provide structured feedback.

## Usage
`/code-review` — Review all staged or unstaged changes in the working tree.  
`/code-review <file>` — Review a specific file.  
`/code-review <PR#>` — Review a GitHub pull request by number.

---

## Instructions

When this skill is invoked, follow the steps below in order.

### 1. Determine the review target

- If a PR number was supplied (e.g., `/code-review 42`), fetch the diff with:
  ```
  gh pr diff <PR#>
  ```
- If a file path was supplied, read that file and compare it with `git diff HEAD -- <file>`.
- Otherwise, collect all local changes:
  ```
  git diff HEAD
  ```
  If the working tree is clean, fall back to the last commit:
  ```
  git diff HEAD~1 HEAD
  ```

### 2. Gather context

Read any files that are **imported or closely related** to the changed code so you understand the surrounding architecture. Do not skip this step — shallow reviews that ignore context produce low-quality feedback.

### 3. Perform the review

Evaluate the changes against the following checklist. Skip categories that are not relevant to the diff.

#### Correctness
- Logic errors, off-by-one errors, incorrect conditions
- Unhandled edge cases (null/None, empty collections, negative numbers)
- Race conditions or concurrency issues

#### Security
- Injection vulnerabilities (SQL, shell, XSS, path traversal)
- Hardcoded secrets or credentials
- Insecure defaults (HTTP instead of HTTPS, world-readable permissions)
- Input validation at system boundaries

#### Performance
- N+1 queries or unnecessary repeated work inside loops
- Missing indexes implied by new query patterns
- Large allocations or copies that could be avoided

#### Maintainability
- Functions or methods that are too long (> ~40 lines) or do too many things
- Naming that is ambiguous or misleading
- Magic numbers or strings that should be named constants
- Dead code, commented-out code, or TODO comments left without an issue reference

#### Tests
- New behavior that has no test coverage
- Tests that only assert the happy path but skip error cases
- Mocks that diverge significantly from real behavior

#### Style / Conventions
- Inconsistency with the surrounding codebase style
- Missing or incorrect error handling patterns used elsewhere in the project

### 4. Write the review report

Structure the output exactly as follows:

```
## Code Review — <target description>

### Summary
<2–4 sentences: what the change does and your overall assessment>

### Issues

| Severity | Location | Issue |
|----------|----------|-------|
| 🔴 Critical | file.py:42 | SQL query built by string concatenation — SQL injection risk |
| 🟠 Major   | utils.js:17 | Return value of `fetchUser` is never awaited |
| 🟡 Minor   | helpers.rb:9 | Variable `tmp` should be named `sanitized_input` |
| 🔵 Nit     | config.go:3  | Import is unused |

### Positive observations
<What was done well — be specific, not generic>

### Recommendations
<Ordered list of the most important changes to make before merging>
```

Severity definitions:
- **Critical** — Must fix before merge; security vulnerability or data-loss risk.
- **Major** — Should fix before merge; incorrect behavior or significant design flaw.
- **Minor** — Should fix; reduces clarity or maintainability but does not affect correctness.
- **Nit** — Optional; style or cosmetic preference.

If there are no issues in a severity tier, omit that row.

### 5. Follow-up

After delivering the report, offer to:
- Explain any issue in more detail
- Suggest a concrete fix for any flagged item
- Re-review after the user makes changes
