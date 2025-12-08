# Comprehensive Admin Panel & Notification System Improvements

## Implementation Status

### Phase 1: Notification Bell System ✅ IN PROGRESS
**Files Created:**
- `services/notifications.ts` - Notification management service
- `components/NotificationBell.tsx` - Bell icon with dropdown

**Still TODO:**
1. Add `userNotifications` node to database.rules.json
2. Update `reviewFestivalRequest()` and `reviewSlokaRequest()` to create user notifications
3. Add NotificationBell to Layout header
4. Deploy database rules

### Phase 2: Super Admin Restrictions (CRITICAL) 🔴 PENDING
**Requirements:**
- Only jashwanthjavili7@gmail.com can:
  - Remove users
  - Add/remove admins
  - Access Firebase storage monitoring
- Regular admins can only:
  - View content
  - Moderate Q&A
  - Review festival/sloka requests
  - View feedback

**Files to Modify:**
- `services/admin.ts` - Add isSuperAdmin() check
- `pages/AdminPanel.tsx` - Hide admin management for non-super admins
- `pages/AdminPanel.tsx` - Hide user deletion for non-super admins
- `database.rules.json` - Restrict admin node writes

### Phase 3: Feedback System Improvements 🔴 PENDING
**Requirements:**
1. If user clicks "Maybe Later" → Don't ask same day
2. After submission → Wait 1-2 weeks (current: 7 days, change to 14 days)

**Files to Modify:**
- `components/FeedbackModal.tsx` - Add "Maybe Later" handler
- `App.tsx` - Update feedback prompt logic (change 168 hours to 336 hours for 14 days)
- `database.rules.json` - Add `lastFeedbackDismissed` field

### Phase 4: Firebase Storage Monitor Fix 🔴 PENDING
**Requirements:**
- Show accurate storage usage
- Only visible to super admin

**Files to Check/Fix:**
- `pages/AdminPanel.tsx` - System Health tab
- May need Firebase Admin SDK for accurate data

### Phase 5: Admin Panel Audit 🔴 PENDING
**Non-Working Features to Remove/Fix:**
1. Activity Logs tab - Currently placeholder
2. Reports & Insights tab - Currently placeholder  
3. System Health - Firebase usage data inaccurate
4. Content Moderation - Flagged content feature incomplete

**Working Features to Keep:**
- Overview & Analytics ✅
- Users Management ✅
- Admins Management ✅ (restrict to super admin)
- User Feedback ✅
- Content Requests ✅ (newly added)
- App Settings (partial)

## Database Schema Changes Needed

```json
{
  "userNotifications": {
    "$userId": {
      "$notificationId": {
        "type": "festival_approved|festival_rejected|sloka_approved|sloka_rejected",
        "title": "string",
        "message": "string",
        "requestId": "string",
        "requestTitle": "string",
        "adminComment": "string?",
        "timestamp": "number",
        "read": "boolean"
      }
    }
  },
  "users": {
    "$userId": {
      "lastFeedbackDismissed": "number"  // NEW - timestamp when user clicked "Maybe Later"
    }
  }
}
```

## Priority Order (What to do first)

1. **HIGHEST**: Super Admin Restrictions (Security critical)
2. **HIGH**: Add userNotifications to database rules
3. **HIGH**: Update request review to send notifications
4. **HIGH**: Add NotificationBell to Layout
5. **MEDIUM**: Feedback "Maybe Later" feature
6. **MEDIUM**: Extend feedback cooldown to 14 days
7. **LOW**: Fix Firebase storage monitoring
8. **LOW**: Remove non-working admin features

## Next Steps

Would you like me to:
A) Continue with super admin restrictions first (most critical for security)
B) Complete the notification system (finish what we started)
C) Work on all items systematically one by one

Please confirm and I'll proceed with the implementation!
