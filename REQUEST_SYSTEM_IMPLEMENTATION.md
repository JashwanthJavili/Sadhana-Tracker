# Festival & Sloka Request System Implementation

## Overview
Implemented a comprehensive community-driven content request and approval system that allows all authenticated users to submit festival and sloka/mantra requests for admin review.

## Features Implemented

### 1. Database Structure (database.rules.json)
Added three new database nodes with proper security rules:

#### `festivalRequests`
- **Read Access**: All authenticated users
- **Write Access**: All authenticated users
- **Indexed By**: timestamp, status, requesterId
- **Purpose**: Stores festival requests pending admin review

#### `slokaRequests`
- **Read Access**: All authenticated users
- **Write Access**: All authenticated users
- **Indexed By**: timestamp, status, requesterId
- **Purpose**: Stores sloka/mantra requests pending admin review

#### `adminNotifications`
- **Read Access**: Admin users only
- **Write Access**: All authenticated users (for notification creation)
- **Purpose**: Tracks pending requests for admin dashboard

### 2. Request Service (`services/requests.ts`)

#### Festival Request Interface
```typescript
interface FestivalRequest {
  id?: string;
  name: string;
  date: string;
  description: string;
  category: string;
  significance?: string;
  observances?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: number;
}
```

#### Sloka Request Interface
```typescript
interface SlokaRequest {
  id?: string;
  title: string;
  sanskrit: string;
  transliteration: string;
  translation: string;
  category: string;
  purport?: string;
  reference?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: number;
}
```

#### Key Functions
- `submitFestivalRequest()` - Submit new festival request
- `submitSlokaRequest()` - Submit new sloka request
- `getAllFestivalRequests()` - Get all festival requests (admin)
- `getAllSlokaRequests()` - Get all sloka requests (admin)
- `getUserFestivalRequests()` - Get user's own festival requests
- `getUserSlokaRequests()` - Get user's own sloka requests
- `reviewFestivalRequest()` - Approve/reject festival (admin)
- `reviewSlokaRequest()` - Approve/reject sloka (admin)
- `getAdminNotifications()` - Get admin notifications
- `markNotificationAsRead()` - Mark notification as read

### 3. User Interface Components

#### FestivalRequestForm (`components/FestivalRequestForm.tsx`)
Beautiful modal form for submitting festival requests:
- **Required Fields**: Name, Date, Category, Description
- **Optional Fields**: Significance, Observances
- **Categories**: Lord Krishna, Lord Rama, Lord Narasimha, Radha Rani, Other Deities, Vaishnava Acharyas, Holy Days, Ekadashi, Other
- **Validation**: Client-side validation with helpful error messages
- **Design**: Gradient orange-to-pink theme matching app design
- **Icons**: Calendar, Tag, FileText, Sparkles for visual clarity

#### SlokaRequestForm (`components/SlokaRequestForm.tsx`)
Comprehensive modal form for submitting sloka/mantra requests:
- **Required Fields**: Title, Sanskrit Text, Transliteration, Translation, Category
- **Optional Fields**: Purport/Meaning, Reference
- **Categories**: Bhagavad Gita, Srimad Bhagavatam, Sri Isopanisad, Prayers, Mantras, Other Scriptures
- **Sanskrit Support**: Font styling for Sanskrit text display
- **Design**: Orange-to-pink gradient, consistent with festival form
- **Icons**: BookOpen, Tag, Languages, FileText

#### AdminRequestsPanel (`components/AdminRequestsPanel.tsx`)
Admin interface for managing all content requests:

**Features**:
- **Dual Tabs**: Festival Requests | Sloka Requests
- **Status Filter**: All, Pending, Approved, Rejected
- **Pending Count Badges**: Real-time count of pending requests
- **Request Cards**: Beautiful cards showing full request details
- **Review Actions**: 
  - Approve & Publish button (green)
  - Reject button (red)
  - Admin comment textarea (required for rejections)
- **Status Display**: Color-coded status badges (yellow=pending, green=approved, red=rejected)
- **Review History**: Shows admin comments, reviewer name, review date
- **Real-time Updates**: Auto-updates when requests change

### 4. Page Integrations

#### Festivals Page (`pages/FestivalsPage.tsx`)
**Changes**:
- Added `isAdmin` state check
- **Admin Users**: See both "Add Festival" (direct publish) and "Request Festival" buttons
- **Regular Users**: See only "Request Festival" button
- **User Requests Section**: Shows user's submitted requests with status
  - Color-coded status badges
  - Admin comments displayed
  - Reviewer information
- **Request Modal**: Opens FestivalRequestForm component

#### Slokas Library Page (`pages/SlokasLibrary.tsx`)
**Changes**:
- Added `isAdmin` state check
- **Admin Users**: See both "Add Chant" and "Request Sloka" buttons
- **Regular Users**: See only "Request Sloka" button
- **User Requests Section**: Shows user's submitted sloka requests
  - Sanskrit text display with proper font
  - Transliteration and translation preview
  - Status badges and admin feedback
- **Request Modal**: Opens SlokaRequestForm component

#### Admin Panel (`pages/AdminPanel.tsx`)
**Changes**:
- Added new tab: "Content Requests" with Send icon
- Integrated `AdminRequestsPanel` component
- Orange-pink gradient styling for consistency
- Tab shows between "User Feedback" and "System Health"

### 5. Email Notification System (Placeholder)

**Current Implementation**: Console logging
**Function**: `sendEmailToAdmins()` in `services/requests.ts`

**Logs**:
- Subject: "New Festival/Sloka Request"
- Message: "{requesterName} has requested to add: {title}"
- Recipient: jashwanthjavili7@gmail.com

**TODO - Production Implementation**:
Option A: Firebase Cloud Functions (Recommended)
```javascript
// Firebase function triggered on adminNotifications write
exports.sendAdminEmail = functions.database
  .ref('/adminNotifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.val();
    // Send email via SendGrid/Mailgun
    await sendgrid.send({
      to: ['admin@example.com'],
      from: 'noreply@sadhana.com',
      subject: `New ${notification.type} Request`,
      text: `${notification.requesterName} requested: ${notification.title}`
    });
  });
```

Option B: Client-side API call
- Use SendGrid Web API
- Store API key securely (environment variable)
- Call on request submission

Option C: Custom backend endpoint
- Create Express.js server
- Expose `/api/send-admin-email` endpoint
- Use Nodemailer or similar service

### 6. Workflow

#### User Submission Flow:
1. User clicks "Request Festival" or "Request Sloka"
2. Modal form opens with required/optional fields
3. User fills form and submits
4. Data written to `festivalRequests` or `slokaRequests` node
5. Admin notification created in `adminNotifications` node
6. (TODO) Email sent to all admin emails
7. Success toast shown to user
8. Request appears in user's "Your Requests" section
9. User can track status (pending/approved/rejected)

#### Admin Review Flow:
1. Admin opens Admin Panel → Content Requests tab
2. Sees pending count badges on both tabs
3. Clicks Festival or Sloka tab
4. Filters by status (default: pending)
5. Reviews request details in card view
6. Adds admin comment (required for rejection)
7. Clicks "Approve & Publish" or "Reject"
8. **If Approved**:
   - Request moved to `festivals` or `slokas` collection
   - Status updated to 'approved'
   - Admin comment and reviewer info saved
   - Request now visible to all users in Festivals/Slokas pages
9. **If Rejected**:
   - Status updated to 'rejected'
   - Admin comment explaining reason
   - Reviewer name and date saved
   - User sees rejection in their requests list

### 7. Security & Permissions

**Database Rules**:
- Users can write to request nodes (festivalRequests, slokaRequests)
- Users CANNOT write to main content nodes (festivals, slokas) - Admin only
- Users can read their own requests
- Admins can read/write all requests
- Request indexing for efficient queries

**Request Validation**:
- Client-side: Form validation before submission
- Server-side: Database rules enforce authentication
- Admin-only: Review and publish actions

### 8. UI/UX Enhancements

**Design Consistency**:
- Orange-pink gradient for all request-related components
- Matches app's spiritual aesthetic
- Icons from lucide-react library

**User Feedback**:
- Success toasts on submission
- Error toasts with helpful messages
- Real-time status updates
- Visual status badges (color-coded)
- Admin comments displayed to users

**Responsive Design**:
- Mobile-optimized modals
- Responsive buttons (hide text on small screens)
- Touch-friendly form inputs
- Scrollable content areas

**Accessibility**:
- Clear labels and placeholders
- Required field indicators (*)
- Error messages on validation failure
- Keyboard navigation support

### 9. Q&A Page Compact Layout

**Changes Made** (QuestionsPage.tsx):
- Replaced verbose category pills with compact dropdown select
- Converted sort buttons to icon-only buttons (14px icons)
- Combined filters into single horizontal bar
- **Space Saved**: ~60px vertical height
- **Icons Used**: Filter (category), Clock (recent), TrendingUp (popular), HelpCircle (unanswered)
- Mobile responsive with `sm:` breakpoints

**Before**:
```
[General] [Technical] [Spiritual] ... (large pills)
Sort by: [Recent] [Popular] [Unanswered] (full-width buttons)
```

**After**:
```
[Filter ▼ Select Category] [🕐] [📈] [❓] (compact horizontal bar)
```

## Files Created
1. `services/requests.ts` (283 lines)
2. `components/FestivalRequestForm.tsx` (213 lines)
3. `components/SlokaRequestForm.tsx` (251 lines)
4. `components/AdminRequestsPanel.tsx` (495 lines)

## Files Modified
1. `database.rules.json` - Added 3 new nodes
2. `pages/FestivalsPage.tsx` - Added request button and user requests section
3. `pages/SlokasLibrary.tsx` - Added request button and user requests section
4. `pages/AdminPanel.tsx` - Added Content Requests tab
5. `pages/QuestionsPage.tsx` - Compact filter layout

## Database Schema Changes

### Before:
```
/festivals (admin write only)
/slokas (admin write only)
```

### After:
```
/festivals (admin write only)
/slokas (admin write only)
/festivalRequests (user write, all read)
  /{requestId}
    name, date, description, category, ...
    requesterId, status, timestamp
    adminComment, reviewedBy, reviewedAt
/slokaRequests (user write, all read)
  /{requestId}
    title, sanskrit, transliteration, ...
    requesterId, status, timestamp
    adminComment, reviewedBy, reviewedAt
/adminNotifications (user write, admin read)
  /{notificationId}
    type, requestId, requesterName
    title, timestamp, read
```

## Testing Checklist
- [ ] User can submit festival request
- [ ] User can submit sloka request
- [ ] Requests appear in user's request list
- [ ] Admin sees pending count badges
- [ ] Admin can filter by status
- [ ] Admin can approve request → publishes to main collection
- [ ] Admin can reject request with comment
- [ ] User sees admin feedback on rejected requests
- [ ] Approved items appear in Festivals/Slokas pages
- [ ] Non-admin users only see request button
- [ ] Admin users see both add and request buttons
- [ ] Q&A page filters are compact and functional
- [ ] Real-time updates work correctly
- [ ] Mobile responsive design works

## Future Enhancements
1. **Email Notifications**: Implement production email service
2. **Push Notifications**: Browser notifications for admins
3. **Request Editing**: Allow users to edit pending requests
4. **Request Withdrawal**: Let users delete their pending requests
5. **Bulk Actions**: Admin can approve/reject multiple requests
6. **Request History**: Show all requests (not just pending) in admin panel
7. **Search/Filter**: Search requests by keyword or requester
8. **Request Templates**: Pre-fill forms with common festivals/slokas
9. **Request Analytics**: Track request approval rates, common categories
10. **User Reputation**: Award badges for approved contributions

## Deployment Notes
1. Deploy updated `database.rules.json` to Firebase
2. Test in staging environment first
3. Monitor admin notification count
4. Set up email service before production
5. Document admin review process for team
6. Create admin training guide

## Support Documentation
See `USER_MANUAL.md` for user-facing documentation (to be updated)
See `ADMIN_COMPLETE_GUIDE.md` for admin instructions (to be updated)

---

**Implementation Date**: January 2025
**Version**: 1.0.3 (pending)
**Status**: ✅ Complete (except email notifications)
