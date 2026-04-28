# 🚨 Required Backend APIs for Admin Dashboard

This document outlines all the missing APIs and updates the backend team needs to implement to fully support the new Admin Dashboard UI.

---

### 1. Admin Tracks API (Content Management)
**Endpoint:** `GET /admin/tracks`

**Why it's needed:** The public `/tracks` endpoint hides drafted or suspended tracks. Admins need a dedicated endpoint to see *all* tracks, including hidden ones, to effectively manage content.

**Expected Query Parameters:**
- `page` (number)
- `limit` (number)
- `search` (string)
- `genre` (string)
- `status` (string: "Published" | "Draft")
- `uploadDate` (string: "7days" | "30days" | "All Time")

---

### 2. User Accounts List (Content Management)
**Endpoint:** `GET /admin/users`

**Why it's needed:** The accounts tab in the Content Management panel requires a list of all users so admins can view, search, and suspend/restore accounts. 

**Expected Query Parameters:**
- `page` (number)
- `limit` (number)
- `search` (string - searches by username or handle)
- `status` (string: "Active" | "Suspended")

---

### 3. Daily Active Users Time-Series (Platform Health)
**Endpoint:** `GET /admin/stats/daily-users`

**Why it's needed:** To draw the 30-day Line Chart/Area Chart on the health dashboard.

**Expected Query Parameters:** 
- `days` (number, default: 30)

**Expected Response Data Array:** 
```json
[ 
  { "date": "Apr 18", "activeUsers": 412 }, 
  { "date": "Apr 19", "activeUsers": 480 } 
]
```

---

### 4. Top Tracks Bar Chart (Platform Health)
**Endpoint:** `GET /admin/stats/top-tracks`

**Why it's needed:** To draw the Top 10 Most Played Tracks bar chart on the health dashboard.

**Expected Query Parameters:** 
- `limit` (number, default: 10)

**Expected Response Data Array:** 
```json
[ 
  { "name": "Midnight Drive", "plays": 12050 }, 
  { "name": "Neon Pulse", "plays": 9840 } 
]
```

---

### 5. Send Warning to User (Reports Moderation)
**Endpoint:** `POST /admin/users/{id}/warn`

**Why it's needed:** The moderation table has a "Warn User" action button. We have endpoints to suspend users and hide tracks, but we need an endpoint that triggers an official warning notification/email to the user without suspending them.

---

### 6. Add Revenue & Subscriptions to General Stats (Platform Health)
**Endpoint Update:** `GET /admin/stats` (Existing endpoint needs updating)

**Why it's needed:** The redesigned top metric cards display Revenue and Active Subscriptions.

**Required Change:** Add the following fields to the existing JSON response:
```json
{
  "totalRevenue": 85400,
  "activeSubscriptions": 250000
}
```
