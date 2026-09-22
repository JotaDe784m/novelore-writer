/**
 * Security Test Specifications (Declarative Test Cases)
 * 
 * NOTE: This file defines declarative security test cases and specifications for
 * Novelore's Firestore Security Rules ("Dirty Dozen" attack vectors).
 * These are specification definitions for auditing and documentation, and are NOT
 * executed against a live Firebase Emulator in this build environment.
 */

export interface TestAuthContext {
  uid: string;
  email?: string;
}

export interface SecurityTestCase {
  id: number;
  name: string;
  auth: TestAuthContext | null;
  operation: "get" | "list" | "create" | "update" | "delete";
  path: string;
  data?: Record<string, unknown>;
  expectedOutcome: "ALLOW" | "PERMISSION_DENIED";
}

export const dirtyDozenTestCases: SecurityTestCase[] = [
  {
    id: 1,
    name: "Unauthenticated client cannot read a novel",
    auth: null,
    operation: "get",
    path: "novels/novel-101",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 2,
    name: "User B cannot read novel owned by User A",
    auth: { uid: "user_b" },
    operation: "get",
    path: "novels/novel-user-a",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 3,
    name: "User B cannot forge ownership by setting ownerId to User A on creation",
    auth: { uid: "user_b" },
    operation: "create",
    path: "novels/novel-b-1",
    data: { id: "novel-b-1", ownerId: "user_a", title: "Forged Novel" },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 4,
    name: "User B cannot update novel owned by User A",
    auth: { uid: "user_b" },
    operation: "update",
    path: "novels/novel-user-a",
    data: { title: "Hijacked Title" },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 5,
    name: "User A cannot transfer ownership by modifying ownerId on update",
    auth: { uid: "user_a" },
    operation: "update",
    path: "novels/novel-user-a",
    data: { id: "novel-user-a", ownerId: "user_b", title: "Transferred" },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 6,
    name: "ID mismatch between path and payload rejected",
    auth: { uid: "user_a" },
    operation: "create",
    path: "novels/novel-100",
    data: { id: "novel-999", ownerId: "user_a", title: "Mismatch Novel" },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 7,
    name: "Path variable injection with invalid characters rejected",
    auth: { uid: "user_a" },
    operation: "get",
    path: "novels/../../admin",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 8,
    name: "User B cannot write to subcollection data of User A's novel",
    auth: { uid: "user_b" },
    operation: "create",
    path: "novels/novel-user-a/data/whiteboard",
    data: { items: [] },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 9,
    name: "Unconstrained list query without ownerId filter rejected",
    auth: { uid: "user_a" },
    operation: "list",
    path: "novels",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 10,
    name: "Creating project without ownerId rejected",
    auth: { uid: "user_a" },
    operation: "create",
    path: "novels/novel-missing-owner",
    data: { id: "novel-missing-owner", title: "No Owner" },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 11,
    name: "Any access (read or write) to /test probe collection rejected (no public access)",
    auth: null,
    operation: "get",
    path: "test/connection",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 12,
    name: "User B cannot delete novel owned by User A",
    auth: { uid: "user_b" },
    operation: "delete",
    path: "novels/novel-user-a",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 13,
    name: "Access to undeclared future subcollection rejected (no wildcard authorization)",
    auth: { uid: "user_a" },
    operation: "get",
    path: "novels/novel-user-a/unauthorized_subcollection/item",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 14,
    name: "User B cannot read scenes in novel owned by User A",
    auth: { uid: "user_b" },
    operation: "get",
    path: "novels/novel-user-a/scenes/scene-1",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 15,
    name: "User B cannot write scenes in novel owned by User A",
    auth: { uid: "user_b" },
    operation: "create",
    path: "novels/novel-user-a/scenes/scene-1",
    data: { id: "scene-1", novelId: "novel-user-a", content: "Hacked" },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 16,
    name: "Scene payload with id mismatching path sceneId rejected",
    auth: { uid: "user_a" },
    operation: "create",
    path: "novels/novel-user-a/scenes/scene-1",
    data: { id: "scene-mismatch", novelId: "novel-user-a", content: "Valid" },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 17,
    name: "Scene payload with novelId mismatching parent novelId rejected",
    auth: { uid: "user_a" },
    operation: "create",
    path: "novels/novel-user-a/scenes/scene-1",
    data: { id: "scene-1", novelId: "novel-other", content: "Valid" },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 18,
    name: "Board payload with novelId mismatching parent novelId rejected",
    auth: { uid: "user_a" },
    operation: "create",
    path: "novels/novel-user-a/boards/main",
    data: { novelId: "novel-other", items: [] },
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 19,
    name: "User B cannot delete scenes from novel owned by User A",
    auth: { uid: "user_b" },
    operation: "delete",
    path: "novels/novel-user-a/scenes/scene-1",
    expectedOutcome: "PERMISSION_DENIED",
  },
  {
    id: 20,
    name: "User B cannot delete boards from novel owned by User A",
    auth: { uid: "user_b" },
    operation: "delete",
    path: "novels/novel-user-a/boards/main",
    expectedOutcome: "PERMISSION_DENIED",
  },
];
