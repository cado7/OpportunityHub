# Security Specification

## Data Invariants
1. **Opportunities**:
   - Must have `title`, `category`, `organization`, `description`, `status`, `createdAt`, `authorId`.
   - `status` must be 'draft' or 'published'.
   - `createdAt` is immutable.
2. **Subscriptions**:
   - Must have `email`, `createdAt`, `status`.
   - `email` must be a string and valid format.
   - `status` is 'active' or 'unsubscribed'.
3. **News**:
   - Must have `title`, `content`, `status`, `createdAt`.
   - Only admins can write.

## The Dirty Dozen Payloads
1. **P1 (Integrity)**: Create opportunity with status "active" (invalid enum).
2. **P2 (Identity)**: Create opportunity with `authorId` pointing to another user.
3. **P3 (PII)**: Anonymous user attempts to read `/subscriptions`.
4. **P4 (Integrity)**: Update `createdAt` of an existing opportunity.
5. **P5 (Identity)**: Non-admin attempts to create a document in `/admins`.
6. **P6 (Poisoning)**: Create subscription with 1MB string in `email`.
7. **P7 (State Change)**: Non-admin attempts to delete a 'published' opportunity they didn't create.
8. **P8 (Integrity)**: Create news document as a regular user.
9. **P9 (State Change)**: Update subscription `status` to 'unsubscribed' as the user (needs admin or private logic, but here we don't have user auth for subscribers).
10. **P10 (Poisoning)**: Use special characters in document ID for `/opportunities`.
11. **P11 (Integrity)**: Create opportunity without a required field `organization`.
12. **P12 (Poisoning)**: Injection of unknown fields into /subscriptions.

## Performance/Cost
- No `get()` in `allow list`.
- Mandatory size checks on strings.
