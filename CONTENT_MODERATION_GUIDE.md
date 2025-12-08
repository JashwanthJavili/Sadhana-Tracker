# Content Moderation & Flagging System

## Overview
Complete content moderation system allowing users to report inappropriate content and admins to review and take action.

## Features Implemented

### 1. User-Facing Flagging
**Location**: Question Detail Page (`pages/QuestionDetailPage.tsx`)

#### Question Flagging
- **Report Button**: Appears at bottom of question card (next to metadata)
- **Access**: Available to all logged-in users except the question author
- **Icon**: Flag icon with "Report" text
- **Styling**: Subtle stone color, changes to red on hover

#### Answer Flagging
- **Report Button**: Appears next to Reply button for each answer
- **Access**: Available to all logged-in users except the answer author
- **Icon**: Flag icon only (compact design)
- **Styling**: Matches question report button style

#### Flag Reason Selection
When user clicks flag button, modal appears with:
- **Title**: "Report Question" or "Report Answer"
- **Reason Options**:
  1. Spam or promotional content
  2. Offensive or inappropriate language
  3. Misinformation or incorrect facts
  4. Off-topic or not relevant
  5. Other
- **Actions**: Click reason to submit, Cancel button to dismiss
- **Confirmation**: "Thank you for reporting. Our team will review this content shortly."

### 2. Admin Moderation Panel
**Location**: Admin Panel → Content Moderation Tab (`pages/AdminPanel.tsx`)

#### Content Filter Tabs
- **All Content**: Shows questions, answers, and flagged items
- **Questions**: Filter to show only questions
- **Answers**: Filter to show only answers
- **Flagged**: Shows only pending flagged content (with count badge)

#### Flagged Content Display
**Visual Design**:
- Red-bordered cards with red background (bg-red-50, border-red-300)
- Flag icon with "Flagged Content Review" title
- Each item shows:
  - Content type badge (QUESTION/ANSWER)
  - Flagged date
  - Content preview (title or answer text)
  - Flag reason

**Admin Actions** (3 buttons):
1. **Approve** (Green ✓): Mark as reviewed/approved
   - Removes from flagged list
   - Content remains visible
   
2. **Unflag** (Blue X): Remove flag without action
   - Removes from flagged list
   - No changes to content
   
3. **Delete** (Red 🗑️): Permanently remove content
   - Deletes question/answer from database
   - Also removes all associated data

#### Quick Actions in Content Lists
Each question and answer card has:
- **Hide Button** (Orange eye-off): Temporarily hide content
- **Flag Button** (Yellow flag): Admin can manually flag for review
- **Delete Button** (Red trash): Permanently delete

### 3. Database Structure

```
flaggedContent/
  {flagId}/
    contentId: string          # ID of flagged question/answer
    contentType: 'question' | 'answer'
    content: object            # Full content snapshot
    flaggedBy: string          # User ID who reported
    flaggedAt: number          # Timestamp
    reason: string             # Selected reason
    status: 'pending' | 'reviewed' | 'removed'
```

### 4. Storage Monitoring Enhancement

**Database Size Card** now shows:
- **Total Size**: Real-time calculation in MB
- **Usage Percentage**: Visual progress bar
- **Breakdown by Category**:
  - Users: X records
  - Questions: Y records
  - Chats: Z records
- **Visual Progress Bar**: Shows % of 1GB free tier used

**Calculation Method**:
- `loadFirebaseUsage()` function runs on admin panel load
- Fetches all data from users, questions, chats nodes
- Calculates size using `JSON.stringify().length`
- Converts bytes to MB: `(totalSize / (1024 * 1024)).toFixed(2)`
- Calculates percentage: `(sizeMB / 1024) * 100`

## User Workflow

### Reporting Content (User)
1. Browse questions/answers on Q&A page
2. Find inappropriate content
3. Click "Report" button (must be logged in)
4. Select reason from modal
5. Receive confirmation message
6. Content flagged for admin review

### Reviewing Reports (Admin)
1. Navigate to Admin Panel
2. Open "Content Moderation" tab
3. Click "Flagged" filter to see pending reports
4. Review flagged item details
5. Choose action:
   - Approve if false positive
   - Unflag if not serious
   - Delete if violates guidelines

## Security Features

### Access Control
- **User Flagging**: Requires authentication
- **Self-Flagging Prevention**: Users cannot flag their own content
- **Admin Only**: Moderation actions restricted to admin users
- **Super Admin**: Only super admins see full admin panel

### Data Protection
- Flag data includes reporter ID for accountability
- Content snapshot stored with flag for context
- Timestamps for audit trail
- Status tracking (pending/reviewed/removed)

## Benefits

### For Users
- ✅ Easy reporting process (2 clicks)
- ✅ Professional reason selection
- ✅ Clear confirmation feedback
- ✅ Community self-moderation

### For Admins
- ✅ Centralized moderation dashboard
- ✅ Clear visual indicators (red borders, badges)
- ✅ Quick action buttons
- ✅ Filter by content type
- ✅ Count of pending flags
- ✅ Detailed storage monitoring
- ✅ Multiple action options

### For Platform
- ✅ Maintains content quality
- ✅ Builds user trust
- ✅ Reduces spam/abuse
- ✅ Scalable moderation workflow
- ✅ Audit trail for compliance
- ✅ Storage optimization visibility

## Technical Implementation

### Files Modified

1. **QuestionDetailPage.tsx**:
   - Added Flag icon import
   - Created `handleFlagContent()` function
   - Added Report button to question metadata
   - Added Flag button to answer actions
   - Implemented reason selection modal

2. **AdminPanel.tsx**:
   - Flag button already implemented in content lists
   - Enhanced Database Size card with breakdown
   - Added visual progress bar
   - Real-time storage calculation display

### Key Functions

**User-Side**:
```typescript
handleFlagContent(contentType, contentId, content)
- Shows reason selection modal
- Saves flag to flaggedContent node
- Includes reporter ID and timestamp
```

**Admin-Side**:
```typescript
handleFlagContent(contentId, contentType, content)
- Admin can manually flag content
- Same database structure

handleUnflagContent(flagId)
- Removes flag from database
- No changes to content

handleApproveContent(flagId)
- Marks as reviewed
- Updates status field

handleDeleteQuestion/Answer()
- Permanently removes content
- Also deletes associated flags
```

## Future Enhancements

Potential improvements:
1. **Auto-Moderation**: Flag content based on keywords
2. **User Reputation**: Track flag accuracy
3. **Appeal System**: Let users dispute deletions
4. **Bulk Actions**: Handle multiple flags at once
5. **Email Notifications**: Alert admins of new flags
6. **Analytics**: Track common flag reasons
7. **Category-Based Storage**: Separate storage limits

## Maintenance

### Regular Tasks
- Review pending flags daily
- Monitor storage usage weekly
- Clean up old flagged items monthly
- Update flag reasons based on patterns

### Database Cleanup
- Approved flags can be deleted after 30 days
- Removed content flags kept for audit (90 days)
- Consider archiving old flags to reduce database size

## Support

For issues or questions:
1. Check Admin Panel → System Health tab
2. Review Database Size breakdown
3. Contact super admin if storage limits reached
4. Check Firebase console for detailed metrics
