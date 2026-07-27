# MSMC — What's Left Before This Is Production-Ready

*Written 2026-07-27. Covers all three parts of the project: the Flutter citizen app, the Next.js admin app, and the database.*

This is an honest list of what still needs to be done before real citizens and real officers use this system with real data. Nothing here is guessed — every item below was checked directly in the code.

Each item is marked:
- 🔴 **Must fix before launch** — security risk, data-loss risk, or the app will break in production even for a small number of users.
- 🟠 **Should fix soon** — won't crash on day one, but will hurt quickly as real usage grows, or is a real feature gap users will notice.
- 🟡 **Can wait** — genuinely optional polish, or something you can add after launch without pain.

---

## 🔴 Must fix before launch

### 1. Citizens are not verified — anyone can pretend to be anyone
Right now, a citizen "logs in" just by typing a name and mobile number into the app. There's no OTP, no password, nothing that proves the phone number is really theirs. Anyone who knows (or guesses) someone else's mobile number can see that person's complaints. This was planned in the old backend (OTP tables already existed there) but was never rebuilt in the current system.
**What's needed:** a real OTP-based login (SMS code sent to the phone, verified before showing any data).

### 2. The admin login secret is a placeholder
The file `msmc-admin/.env` has:
```
JWT_SECRET="dev-only-change-me-msmc-admin-secret"
```
This literally says "change me." If this goes live as-is, anyone who guesses or leaks this value can forge an officer login session and get full admin access.
**What's needed:** generate a real random secret and set it only on the production server (never commit it to git).

### 3. Uploaded files (verdict PDFs, initiative photos) are stored on the server's local disk
They're saved to a folder called `uploads/` inside the app itself. This works fine on your laptop, but breaks the moment you deploy to almost any modern hosting (Vercel, most cloud platforms) because:
- Each new deployment wipes the files, or
- If you run more than one server copy, each copy has different files, so a file uploaded on one server won't be found by another.
**What's needed:** store these files somewhere shared and permanent — e.g., AWS S3, Cloudflare R2, or similar — instead of the local disk.

### 4. The Android app is signed with a "debug" key, not a real release key
Inside `mobile-app/msmc/mobile/android/app/build.gradle.kts`, there's a comment left by the build tool itself:
```
// TODO: Add your own signing config for the release build.
// Signing with the debug keys for now
```
An app signed this way **cannot be published to the Google Play Store**, and if you ever change signing keys later, existing installs can't be updated — they'd need to be reinstalled.
**What's needed:** create a real release signing key and wire it in before any Play Store submission.

### 5. No rate limiting on any public endpoint
The complaint-submission, feedback, and login endpoints have no limit on how many times someone can hit them per minute. Right now, anyone (a bot, or someone being malicious) could spam thousands of fake complaints or feedback entries, or hammer the login page trying passwords, with nothing stopping them.
**What's needed:** basic rate limiting on public endpoints (submit complaint, feedback, login).

---

## 🟠 Should fix soon

### 6. Submitted feedback has nowhere to be seen
Citizens can submit feedback (star rating + message) through the app, and it's saved to the database correctly — but there is **no page anywhere in the admin dashboard to read it**. Right now the only way to see feedback is to open the database directly in pgAdmin. It's a fully working feature that nobody at MSMC can actually use yet.
**What's needed:** a simple "Feedback" page in the admin sidebar showing submitted feedback.

### 7. Three app sections are still hardcoded — MSMC can't update them without releasing a new app version
- **Schemes** screen
- **PM Scheme** screen
- **About** screen (includes chairman/commission member info)

All three still show fixed content baked into the app itself (`schemes_content.dart`, `pm_scheme_content.dart`, `about_content.dart`), the same way Documents/Education/Initiatives/News used to before this integration work. If MSMC wants to update a scheme description or change a commission member's name, it currently requires a developer to edit code and publish a new app version.
**What's needed:** the same treatment already done for Documents/Education/Initiatives/News — real database tables + an admin screen to edit them.

### 8. Citizens can't attach documents to a complaint
The complaint form only asks for name, mobile number, category, and description — there's no way to attach a supporting photo or PDF, even though the database already has a field for it (`attachmentPath`) and old translation text for it ("Upload Supporting Documents") is still sitting unused in the translation files.
**What's needed:** add a file picker to the "New Complaint" screen and wire it to actually upload.

### 9. No admin can see more than "all officers can do everything"
Every officer account has full access to every admin page — accept/reject complaints, create other officer accounts, edit all content. There's no "regular officer" vs "supervisor/admin" distinction. Anyone with an officer login can create more officer logins.
**What's needed:** decide if this is intentional for now, or if you need a proper permission/role system (e.g., only a super-admin can create new officer accounts).

### 10. Officer names on complaints aren't connected to real officer accounts
When you "Assign Officer" on a complaint, you're picking from a fixed list of 6 names (Rahul Patil, Amit Sharma, etc.) that live in a config file — completely separate from the real officer login accounts on the Users page. If a real officer account is created or deactivated, it has zero effect on this assignment list, and vice versa.
**What's needed:** make "Assign Officer" pick from actual officer accounts instead of a hardcoded name list.

### 11. Nothing has automated tests
Neither the admin app nor the Flutter app has any real automated test coverage (the one Flutter test file that exists doesn't even run — see #16 below). Every change has to be manually checked by hand. This isn't dangerous today, but it means every future change carries more risk of quietly breaking something old.
**What's needed:** at minimum, a handful of tests around the most important flows (complaint submission, login, status changes).

### 12. No pagination anywhere — every list loads everything at once
Complaints, Users, Documents, Education, Initiatives, News — every single admin list page fetches *every row in the table* in one go, with no "page 1 of 10" or "load more." Today, with a handful of rows, this is invisible. Once there are thousands of complaints, these pages will get slow and eventually painful to use.
**What's needed:** add pagination (or infinite scroll) to these list pages before real usage builds up.

### 13. Admin search box does nothing
The search bar at the top of every admin page is just a decoration — typing into it doesn't filter or search anything.
**What's needed:** either wire it up to actually search, or remove it so it doesn't mislead people.

### 14. No error tracking or uptime monitoring
If something breaks in production — the admin app throws an error, or the API starts failing — nobody is notified automatically. You'd only find out if a citizen or officer complains, or if you happen to check the server logs.
**What's needed:** a basic error-tracking tool (e.g., Sentry) and a simple uptime check.

### 15. No CI/CD — every deploy is manual
There's no automated pipeline that runs checks (type-check, lint, build, tests) before code goes live. Right now, "did I break something" is only answered by manually running commands.
**What's needed:** a basic GitHub Actions workflow that runs checks automatically on every push.

---

## 🟡 Can wait (real, but lower priority)

### 16. The one existing Flutter test hangs and never finishes
This is a **pre-existing bug** (confirmed it happens even on the original code, before any of the recent integration work) — something in how the app's splash screen and localization set up during a test causes it to freeze rather than fail or pass. It's not currently blocking anything since it's the only test file, but it should be fixed before adding more tests on top of it.

### 17. No push notifications
Citizens aren't notified when their complaint status changes (accepted, hearing scheduled, resolved, etc.) — they'd have to open the app and check manually. This is a real feature many citizens would expect, but not something that blocks a first launch.

### 18. No offline support / caching
If a citizen has no internet, every screen just shows an error. There's no "show last-seen data while offline" behavior.

### 19. Password reset for officers is a dead end
The "Forgot Password" page just tells the officer to "contact your system administrator" — there's no real self-service reset flow (no reset email, no reset link). Fine for a small team, would not scale to more officers.

### 20. Retired Express backend is still sitting in the repo
`mobile-app/msmc/backend` is a whole separate backend that's no longer used (confirmed earlier: only a health-check route works, everything else was scaffolded and abandoned in favor of the Next.js API). It doesn't cause harm sitting there, but it's dead weight that could confuse a future developer into thinking it's live.
**What's needed:** either finish deciding its fate (delete it, or clearly document it as retired) — this was flagged before and is still unresolved.

### 21. No privacy policy / terms of service
Required by both the Play Store and App Store before publishing an app that collects any personal data (name, mobile number). Doesn't exist yet in any form.

### 22. No production deployment set up yet
Everything today runs on your local machine — local Postgres, local Next.js dev server. There's no live server, no domain, no HTTPS certificate, no production database. This entire list assumes you're planning that next; if a firm launch date exists, this is the actual first blocking step.

---

## Quick summary — if you can only do 5 things first

1. Real OTP login for citizens (#1)
2. Real production secret + move file uploads off local disk (#2, #3)
3. Real Android release signing (#4)
4. Basic rate limiting on public endpoints (#5)
5. A working production deployment with a real database (#22)

Everything else can reasonably follow after that, roughly in the order listed above.
