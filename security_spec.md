# Novelore Security Specification (Firestore Security & Project Ownership)

## Phase 1 & 1.1: Security Architecture & Fortress Rules (Hardened)

This document specifies the Attribute-Based Access Control (ABAC), data integrity invariants, and attack vector defense matrix for Novelore's cloud persistence layer.

---

## 1. Core Data Invariants

1. **Owner-Exclusive Tenancy**:
   - Every document inside `/novels/{novelId}` stored in Firestore MUST have an `ownerId` property.
   - The `ownerId` MUST match the authenticated user's Firebase Auth UID (`request.auth.uid`).
   - Anonymous or unauthenticated users CANNOT read, list, create, update, or delete documents in `/novels/{novelId}`.

2. **Immutable Ownership (`ownerId`)**:
   - Once a novel document is created with an `ownerId`, that `ownerId` is strictly immutable:
     `request.resource.data.ownerId == resource.data.ownerId`.
   - No user (including the owner themselves) can transfer ownership to another UID or strip the `ownerId` field.

3. **Document ID Consistency**:
   - The path document ID `{novelId}` must match the internal `id` property of the project payload:
     `request.resource.data.id == novelId`.

4. **Explicit Subcollection Authorization (Least Privilege)**:
   - Wildcard subcollection matches (`/{allSubcollections=**}`) are strictly banned.
   - Only explicitly verified subcollections have rule declarations (currently only `/novels/{novelId}/data/whiteboard`).
   - Access to `/novels/{novelId}/data/whiteboard` requires verified ownership of the root novel document:
     `get(/databases/$(database)/documents/novels/$(novelId)).data.ownerId == request.auth.uid`.
   - Any future subcollection (e.g. `/novels/{novelId}/versions`) requires an explicit rule addition and will not inherit access by default.

5. **Zero Public Access / Elimination of /test**:
   - NO public read, list, or write rules exist in `firestore.rules` (`allow read: if true` and `allow write: if true` are strictly forbidden).
   - The artificial `/test/connection` public probe has been completely eliminated. Firestore connectivity is handled by standard SDK initialization, Auth state, and operational error handling.

6. **Query Boundaries (Secure List)**:
   - Client queries against the `/novels` collection MUST be filtered by `where("ownerId", "==", request.auth.uid)`.
   - Wildcard or unconstrained collection listing is rejected at the rule level.

7. **Local-First Independence**:
   - The local client state in `localStorage` operates autonomously without Firestore dependencies.
   - When no user is signed in (`auth.currentUser == null`), no Firestore network calls are issued.

---

## 2. Threat Payloads Matrix (Attack Vectors)

The following attack vectors are explicitly mitigated and rejected with `PERMISSION_DENIED` by `firestore.rules`:

| # | Attack Vector | Payload / Action Description | Enforced Rule Guard |
|---|---------------|------------------------------|---------------------|
| 1 | **Unauthenticated Read** | Anonymous client requests `GET /novels/proj-123` | `isSignedIn()` |
| 2 | **Cross-Tenant Snoop** | User `B` requests `GET /novels/proj-owned-by-user-A` | `resource.data.ownerId == request.auth.uid` |
| 3 | **Forged Ownership Create** | User `B` submits `CREATE /novels/proj-new` with `ownerId: "user-A"` | `request.resource.data.ownerId == request.auth.uid` |
| 4 | **Ownership Hijack Update** | User `B` submits `UPDATE /novels/proj-user-A` modifying `title` | `resource.data.ownerId == request.auth.uid` |
| 5 | **Ownership Transfer Exploit** | User `A` tries to change `ownerId` from `"user-A"` to `"user-B"` | `request.resource.data.ownerId == resource.data.ownerId` |
| 6 | **ID Spoofing Attack** | Client submits `CREATE /novels/proj-100` with payload `id: "proj-999"` | `request.resource.data.id == novelId` |
| 7 | **Path Variable Injection** | Client tries path `/novels/../../../etc/passwd` or oversized junk ID | `isValidId(novelId)` regex & length guard |
| 8 | **Orphaned Subcollection Write** | User `B` attempts `SET /novels/proj-user-A/data/whiteboard` | Parent doc lookup verifies `ownerId == request.auth.uid` |
| 9 | **Global List Snooping** | User calls `getDocs(collection(db, "novels"))` without filter | `allow list: if isSignedIn() && resource.data.ownerId == request.auth.uid` |
| 10 | **Missing OwnerId Creation** | Client submits `CREATE /novels/proj-123` omitting `ownerId` | Schema check: `request.resource.data.ownerId is string` |
| 11 | **Public Probe / Collection Probe Access** | Client attempts `GET` or `WRITE` to `/test/connection` | Document denied by default (no rule exists) |
| 12 | **Cross-Tenant Deletion** | User `B` calls `DELETE /novels/proj-user-A` | `resource.data.ownerId == request.auth.uid` |
| 13 | **Undeclared Future Subcollection** | User requests `GET /novels/proj-123/unregistered/item` | Subcollection denied by default (no wildcard exists) |

---

## 3. Declarative Test Specifications (`firestore.rules.test.ts`)

A companion specification file defines these attack vectors and their expected outcomes (`PERMISSION_DENIED`). Note that these are declarative test specifications for security auditing; they are not executed against a live Firebase Emulator in this container environment.
