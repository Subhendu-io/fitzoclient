# Auth, Sign-In, and Gym Join Flow

This document describes how the app currently signs users up, signs them in, and handles scanning a gym QR/deep link to join a gym and check in. It also lists the Firestore collections involved and the Firebase security rules behavior the client expects.

This is based on the current client implementation in this repository. A few parts of the gym join flow rely on backend Cloud Functions or server-side sync that are referenced by the app but not implemented in this repo.

## Scope

This document covers:

- Email sign-up
- Email sign-in
- Phone sign-up
- Phone sign-in
- QR/deep-link scanning to join a gym
- Invite acceptance flow
- Join-request flow
- Subscription check before attendance
- Firestore collections read/written by the client
- Recommended Firebase rules behavior required by this app

## Main Files

### Auth

- `src/features/auth/services/authService.ts`
- `src/features/auth/screens/RegisterScreen.tsx`
- `src/features/auth/screens/LoginScreen.tsx`
- `src/features/auth/screens/PhoneLoginScreen.tsx`
- `src/features/auth/screens/OTPScreen.tsx`
- `src/services/userService.ts`
- `src/store/useAuthStore.ts`
- `app/index.tsx`
- `app/_layout.tsx`

### Scanner and gym join

- `src/features/scanner/screens/ScannerScreen.tsx`
- `src/features/scanner/services/scanFlowService.ts`
- `src/features/scanner/services/qrVerifyService.ts`
- `src/services/deepLinkService.ts`
- `src/services/memberService.ts`
- `src/constants/collection.ts`

## High-Level Flow

### 1. App startup and auth restoration

When the app starts:

1. `app/_layout.tsx` listens to Firebase Auth using `onAuthStateChanged(...)`.
2. If a Firebase user exists, the app reads `appusers/{uid}` using `getAppUser(uid)`.
3. The app stores:
   - Firebase auth user in `useAuthStore.user`
   - app profile in `useAuthStore.profile`
4. Routing then behaves as follows in `app/index.tsx`:
   - no Firebase user -> redirect to `/(auth)`
   - Firebase user exists, but no `appusers/{uid}` profile -> redirect to `/(onboarding)/step1`
   - Firebase user and profile both exist -> redirect to `/(tabs)/home`

### 2. Sign-up / sign-in options

The app supports:

- Email sign-up
- Email sign-in
- Phone sign-up via OTP
- Phone sign-in via OTP

### 3. Gym join / scan

The scanner flow accepts a QR payload or deep link that contains:

- `tenantId`
- `branchId` (optional in some cases, defaults to the configured default branch)

Once scanned, the app:

1. Parses the deep link
2. Ensures the user is authenticated
3. Checks whether the user already belongs to the branch
4. If not already linked, looks for an invite
5. If an invite exists, accepts it
6. If no invite exists, sends a join request through a Cloud Function
7. Fetches the member record linked to the current auth user
8. Fetches the active subscription for that member
9. If a valid subscription exists, writes an attendance record

## Auth Flow Details

## Email Sign-Up

Source: `src/features/auth/services/authService.ts`, `src/features/auth/screens/RegisterScreen.tsx`

### Input

- `firstName`
- `lastName`
- `email`
- `password`

### Steps

1. `RegisterScreen` validates name, email format, password length, and password confirmation.
2. It calls `signUpWithEmail(...)`.
3. `signUpWithEmail(...)` creates the Firebase Auth user using `createUserWithEmailAndPassword(...)`.
4. It updates the Firebase Auth display name.
5. It creates a Firestore profile document in `appusers/{uid}`.

### Firestore write

Collection/document:

- `appusers/{uid}`

Fields currently written by the client:

- `uid`
- `firstName`
- `lastName`
- `email`
- `gyms: []`
- `createdAt`

### Result

- Firebase Auth session becomes active
- `onAuthStateChanged` loads the profile
- screen redirects to home

## Email Sign-In

Source: `src/features/auth/screens/LoginScreen.tsx`

### Steps

1. User enters email and password.
2. `LoginScreen` calls `signInWithEmailAndPassword(getAuth(), email, password)`.
3. The screen stores the user in auth state and routes to `/(tabs)/home`.
4. Root layout later refreshes profile state from `appusers/{uid}`.

### Firestore access

- no Firestore write during sign-in itself
- after auth success, app reads `appusers/{uid}`

## Phone Sign-Up

Source: `src/features/auth/screens/RegisterScreen.tsx`, `src/features/auth/screens/OTPScreen.tsx`, `src/features/auth/services/authService.ts`

### Input

- `firstName`
- `lastName`
- `phone`

### Steps

1. `RegisterScreen` validates name and phone.
2. It calls `signInWithPhone(fullPhone)`.
3. Firebase sends an OTP and returns a `verificationId`.
4. User is routed to `OTPScreen`.
5. `OTPScreen` calls `verifyPhoneOTP(verificationId, otpCode)`.
6. If the screen was opened in new-user mode, it calls `completePhoneSignup(uid, firstName, lastName, phone)`.
7. `completePhoneSignup(...)` merges data into `appusers/{uid}`.

### Firestore write

Collection/document:

- `appusers/{uid}`

Fields currently written or merged:

- `uid`
- `firstName`
- `lastName`
- `phone`
- `gyms: []`
- `createdAt`

### Result

- Firebase Auth session is active
- profile exists or is merged
- user is routed to home

## Phone Sign-In

Source: `src/features/auth/screens/PhoneLoginScreen.tsx`, `src/features/auth/screens/OTPScreen.tsx`

### Steps

1. User enters phone number.
2. App calls `signInWithPhone(fullPhone)`.
3. Firebase sends OTP and returns `verificationId`.
4. `OTPScreen` verifies OTP using `verifyPhoneOTP(...)`.
5. For existing users, the app routes directly to home.
6. Root layout later reads `appusers/{uid}`.

### Firestore access

- no Firestore write during sign-in itself
- after auth success, app reads `appusers/{uid}`

## App User Profile Model

The app uses `appusers/{uid}` as the client-owned profile document.

Relevant fields used by the join-gym flow:

- `uid`
- `firstName`
- `lastName`
- `email`
- `phone`
- `gyms: string[]`
- `branchIds?: string[]`
- `activeGym?: string`
- `activeBranchId?: string`
- `createdAt`
- `updatedAt`

The app derives the active gym and branch from:

- `profile.activeGym`
- `profile.activeBranchId`
- fallback to first item in `gyms` / `branchIds`

## Gym Scan and Join Flow

Source: `src/features/scanner/services/scanFlowService.ts`

## Step 1. Parse QR or deep link

The scanner passes QR data into `executeScanFlow(data, user, profile)`.

`parseDeepLink(...)` accepts values such as:

- query-string style data containing `tenantId=...&branchId=...`
- app deep links
- some raw values where the tenant id is directly encoded

If parsing fails, the flow returns:

- `INVALID_LINK`

## Step 2. Check authentication

If no Firebase Auth user is present:

1. the app stores the pending `tenantId` and `branchId` in `useDeepLinkStore`
2. the flow returns `AUTH_REQUIRED`
3. `ScannerScreen` redirects the user to login
4. after login, `app/_layout.tsx` detects the pending deep link and sends the user back to the scanner

## Step 3. Check whether the user is already linked to the branch

The app decides whether the user is already part of the branch using profile fields:

- `profile.branchIds?.includes(branchId)`
- or, for the default branch, `profile.gyms?.includes(tenantId)`

If already linked, the app skips invite/join-request handling and moves to membership lookup.

## Step 4. Check for an invite

Source: `src/features/scanner/services/qrVerifyService.ts`

The app queries:

- `tenants/{tenantId}/branches/{branchId}/invites`

It looks for one invite with:

- matching `email` and `status == "Invited"`
- or matching `phone` and `status == "Invited"`

If an invite is found, the client accepts it immediately.

## Step 5. Accept invite

Source: `src/features/scanner/services/qrVerifyService.ts`

The client uses a Firestore batch to update two documents.

### Write 1: invite doc

Document:

- `tenants/{tenantId}/branches/{branchId}/invites/{inviteId}`

Fields updated:

- `status: "Accepted"`
- `acceptedAt`
- `uid`

### Write 2: app user doc

Document:

- `appusers/{uid}`

Fields updated:

- `gyms: arrayUnion(tenantId)`
- `branchIds: arrayUnion(branchId)`
- `activeGym: tenantId`
- `activeBranchId: branchId`
- `updatedAt`

### Important note

Accepting the invite does **not** create the branch `members/{memberId}` document inside this client code.

After invite acceptance, the rest of the flow expects a member record to already exist or to be created/linked by backend logic. If that member record is missing, the client falls back to the same outcome as a join request flow.

## Step 6. Create join request when no invite exists

Source: `src/features/scanner/services/qrVerifyService.ts`

If no invite is found, the app calls the Firebase callable function:

- `createJoinRequest`

Payload:

- `tenantId`
- `branchId`
- `displayName`

### Important note

The client does **not** write directly to a Firestore `joinRequests` collection in this repo. That write is expected to happen inside the callable Cloud Function implementation.

This means:

- Firestore rules can deny direct client writes to `joinRequests`
- access control for join requests should primarily live in the Cloud Function

## Step 7. Resolve member record

Source: `src/services/memberService.ts`

The app queries:

- `tenants/{tenantId}/branches/{branchId}/members`

Query:

- `where("uid", "==", auth.uid)`
- `limit(1)`

If no matching member doc is found:

- the flow returns `JOIN_REQUEST_SENT`

That behavior is used as a fallback even after invite acceptance, because the current client assumes a member link may still be syncing or may be created by backend logic.

## Step 8. Check active subscription

Source: `src/services/memberService.ts`

The app queries:

- `tenants/{tenantId}/branches/{branchId}/subscriptions`

Query:

- `where("memberId", "==", memberId)`
- `orderBy("startDate", "desc")`

The app then accepts only a subscription where:

- `status === "active"`
- `now >= startDate`
- `now <= endDate`

If none is found, the flow returns:

- `NO_SUBSCRIPTION`

## Step 9. Mark attendance

Source: `src/services/memberService.ts`

When a valid active subscription exists, the app writes a new document to:

- `tenants/{tenantId}/branches/{branchId}/attendance`

Fields written:

- `memberId`
- `actorType: "member"`
- `actorId: memberId`
- `punchedAt: serverTimestamp()`
- `source: "QR"`
- `punchType: "CHECK_IN"`
- `createdAt: serverTimestamp()`

Result returned to the UI:

- `ATTENDANCE_MARKED`

## Collections Read and Written

## Auth collections

### `appusers`

Path:

- `appusers/{uid}`

Reads:

- app startup profile fetch
- post-login profile fetch

Writes:

- email sign-up creates the document
- phone sign-up creates or merges the document
- invite acceptance updates gyms and active gym state
- profile updates elsewhere in the app may also update this document

## Gym join collections

### `tenants`

Path:

- `tenants/{tenantId}`

Usage:

- tenant metadata is read elsewhere in the app
- not required for the minimal scanner flow itself

### `branches`

Path:

- `tenants/{tenantId}/branches/{branchId}`

Usage:

- parent path for invites, members, subscriptions, and attendance

### `invites`

Path:

- `tenants/{tenantId}/branches/{branchId}/invites/{inviteId}`

Reads:

- query by email + `status == "Invited"`
- query by phone + `status == "Invited"`

Writes:

- update invite to accepted

### `members`

Path:

- `tenants/{tenantId}/branches/{branchId}/members/{memberId}`

Reads:

- query by `uid == auth.uid`

Writes:

- none from the current client scanner flow
- expected to be created or linked by backend/admin flow

### `subscriptions`

Path:

- `tenants/{tenantId}/branches/{branchId}/subscriptions/{subscriptionId}`

Reads:

- query by `memberId`

Writes:

- none in this scanner flow

### `attendance`

Path:

- `tenants/{tenantId}/branches/{branchId}/attendance/{attendanceId}`

Reads:

- attendance history is read elsewhere in the app

Writes:

- create check-in record after active subscription validation

### `joinRequests`

Path:

- likely a server-managed collection such as `tenants/{tenantId}/branches/{branchId}/joinRequests/{requestId}` or an equivalent backend-managed path

Reads:

- none in the current client implementation

Writes:

- not written directly by the client in this repo
- expected to be written by the `createJoinRequest` callable function

## End-to-End Join Gym Scenarios

## Scenario A: user scans before logging in

1. user scans QR code
2. app extracts `tenantId` and `branchId`
3. app sees no authenticated user
4. app stores pending scan context
5. app routes to login
6. user signs in or signs up
7. root layout restores pending scan
8. app reopens scanner flow
9. app continues with invite lookup or join-request creation

## Scenario B: logged-in user has an invite

1. user scans QR code
2. app confirms auth state
3. app checks whether `appusers/{uid}` already lists this branch
4. app queries branch invites by email or phone
5. app finds invite
6. app updates invite to `Accepted`
7. app updates `appusers/{uid}` with gym and branch membership metadata
8. app looks up `members` doc by `uid`
9. app checks `subscriptions`
10. app writes `attendance`
11. user sees success

## Scenario C: logged-in user has no invite

1. user scans QR code
2. app confirms auth state
3. app sees no existing branch membership in `appusers/{uid}`
4. app finds no invite
5. app calls `createJoinRequest`
6. app shows `JOIN_REQUEST_SENT`

## Scenario D: logged-in invited user but no member record exists yet

1. invite is accepted
2. `appusers/{uid}` is updated
3. app queries `members` by `uid`
4. no member doc is found
5. app falls back to `JOIN_REQUEST_SENT`

This is an important implementation detail: the app currently assumes that invite acceptance alone is not enough unless a `members` doc also exists.

## Permission Flow in the App

## Camera permission

Source: `src/features/scanner/screens/ScannerScreen.tsx`

The scanner uses `expo-camera` and calls `useCameraPermissions()`.

Behavior:

1. if permission has not been resolved yet, the screen requests it
2. if permission is denied, the app shows a "Grant Permission" button
3. only after camera permission is granted can the user scan a QR code

This permission is an operating-system permission, not a Firebase permission.

## Firebase auth permission

The scanner flow requires a logged-in Firebase user for any gym-join operation.

Behavior:

1. unauthenticated user scans
2. app saves pending tenant/branch context
3. app redirects to login
4. after login, the pending scan is resumed

## Firestore data permission

Even with a logged-in user, the app still needs Firestore rules that allow the exact reads and writes below. If these rules are too strict, the scanner flow will fail silently or degrade into missing-membership behavior.

## Firebase Rules Requirements

This section describes the **required behavior** of the rules based on the current client flow.

## 1. `appusers/{uid}`

The client needs:

- authenticated user can read own `appusers/{uid}`
- authenticated user can create own `appusers/{uid}` during sign-up
- authenticated user can update own `appusers/{uid}`

This is required for:

- sign-up profile creation
- profile bootstrap after login
- storing gym linkage fields during invite acceptance

Recommended rule behavior:

- allow read, create, update if `request.auth.uid == uid`
- do not allow users to access another user's app profile

## 2. `invites`

The client needs:

- logged-in user can query invite docs only when the invite belongs to them
- logged-in user can update an invite from `Invited` to `Accepted` only if they are the intended invitee

Required matching logic:

- `resource.data.email == request.auth.token.email`
- or `resource.data.phone == request.auth.token.phone_number`

Required write protection:

- only allow transition from `Invited` to `Accepted`
- only allow setting `uid == request.auth.uid`
- ideally disallow arbitrary field mutation by the client

Important note:

Because invite queries are filtered by email or phone, the rules must be written so the user can only read invite documents that match their own auth identity. Broad read access to all invites would expose private invite data.

## 3. `members`

The client needs:

- logged-in user can query member docs where the member is linked to their auth uid

Required rule behavior:

- allow read only when `resource.data.uid == request.auth.uid`

This is required for:

- resolving the member record after invite acceptance
- any later member-based features in the app

## 4. `subscriptions`

The client needs:

- logged-in user can read subscriptions for their own linked member record

Because subscription docs are looked up by `memberId`, the rules should ensure:

- the member referenced by the subscription belongs to `request.auth.uid`

This usually means one of the following:

- each subscription doc includes enough ownership information to validate directly
- or rules use `get(...)` on the corresponding `members/{memberId}` doc and check that `uid == request.auth.uid`

## 5. `attendance`

The client needs:

- logged-in user can create a check-in attendance record only for their own member identity

Recommended rule behavior:

- allow create only if the `memberId` or `actorId` belongs to a `members/{memberId}` document whose `uid == request.auth.uid`
- validate that `source == "QR"` and `punchType == "CHECK_IN"` if you want to keep this client path tightly scoped
- deny update/delete from normal members unless there is a separate admin/staff role

## 6. `joinRequests`

Current client behavior implies:

- direct client access is not required
- direct client writes may be denied entirely
- the Cloud Function `createJoinRequest` should validate auth and write the request server-side

This is the safest option because the function can enforce:

- authenticated caller only
- one request per user per branch
- no duplicate request spam
- no forged membership linkage

## Recommended Firestore Rule Skeleton

The exact rule structure will depend on your existing schema, but the client expects behavior similar to this:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isSelf(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    function authEmail() {
      return isSignedIn() ? request.auth.token.email : null;
    }

    function authPhone() {
      return isSignedIn() ? request.auth.token.phone_number : null;
    }

    match /appusers/{uid} {
      allow read, create, update: if isSelf(uid);
    }

    match /tenants/{tenantId}/branches/{branchId}/invites/{inviteId} {
      allow read: if isSignedIn() && (
        (resource.data.email != null && resource.data.email == authEmail()) ||
        (resource.data.phone != null && resource.data.phone == authPhone())
      );

      allow update: if isSignedIn()
        && (
          (resource.data.email != null && resource.data.email == authEmail()) ||
          (resource.data.phone != null && resource.data.phone == authPhone())
        )
        && resource.data.status == "Invited"
        && request.resource.data.status == "Accepted"
        && request.resource.data.uid == request.auth.uid;
    }

    match /tenants/{tenantId}/branches/{branchId}/members/{memberId} {
      allow read: if isSignedIn() && resource.data.uid == request.auth.uid;
    }

    match /tenants/{tenantId}/branches/{branchId}/subscriptions/{subscriptionId} {
      allow read: if isSignedIn()
        && exists(/databases/$(database)/documents/tenants/$(tenantId)/branches/$(branchId)/members/$(resource.data.memberId))
        && get(/databases/$(database)/documents/tenants/$(tenantId)/branches/$(branchId)/members/$(resource.data.memberId)).data.uid == request.auth.uid;
    }

    match /tenants/{tenantId}/branches/{branchId}/attendance/{attendanceId} {
      allow create: if isSignedIn()
        && exists(/databases/$(database)/documents/tenants/$(tenantId)/branches/$(branchId)/members/$(request.resource.data.memberId))
        && get(/databases/$(database)/documents/tenants/$(tenantId)/branches/$(branchId)/members/$(request.resource.data.memberId)).data.uid == request.auth.uid;
    }

    match /tenants/{tenantId}/branches/{branchId}/joinRequests/{requestId} {
      allow read, write: if false;
    }
  }
}
```

## Important Gaps and Implementation Notes

These are important to keep in mind while implementing backend logic and rules:

### 1. Invite acceptance does not create member docs in the client

The client accepts invites by updating:

- the invite
- the app user profile

But the scanner flow still depends on:

- `tenants/{tenantId}/branches/{branchId}/members/{memberId}` with `uid == auth.uid`

So one of these must be true:

- the member doc already exists before the scan
- a Cloud Function creates or links the member doc during invite acceptance
- a separate sync process creates that member link

### 2. `createJoinRequest` is function-driven

The join request path is not a direct Firestore client write in this repo. Any required deduplication, approval flow, or staff notification should happen in the callable backend.

### 3. `verifyQrScan` and `linkMemberProfile` exist but are not used in the main scan flow

This repo defines these callable names:

- `verifyQrScan`
- `linkMemberProfile`
- `createJoinRequest`

Only `createJoinRequest` is used in the current `executeScanFlow(...)` flow.

### 4. Permission-denied reads are partially swallowed by the client

Some reads in `memberService.ts` return `null` or `[]` when Firestore throws `permission-denied`.

That means broken rules can look like:

- missing member record
- missing subscription
- empty attendance history

Instead of a loud error.

## Backend Checklist

If you want the current app flow to work reliably, the backend should guarantee:

1. `appusers/{uid}` is readable and writable by the authenticated owner.
2. Invite docs are readable only by the invited email/phone owner.
3. Invite acceptance can safely update both the invite doc and `appusers/{uid}`.
4. A `members` doc exists and is linked to `auth.uid` before subscription checks run.
5. Subscription docs are readable for the user’s linked member record.
6. Attendance writes are restricted to the caller’s own member identity.
7. Join requests are created by Cloud Function, not open client writes.

## Summary

The app uses a two-layer identity model:

- Firebase Auth user for authentication
- `appusers/{uid}` for app profile and gym linkage state

The scan-to-join flow then depends on branch-level gym data under:

- `tenants/{tenantId}/branches/{branchId}/...`

For a successful "scan and join/check-in" path, the client expects:

1. authenticated user
2. matching invite or callable join request
3. linked branch `members` doc for that auth user
4. active `subscriptions` doc for that member
5. permission to create `attendance`

Without those reads/writes being allowed by Firebase rules, the join flow will not complete.
