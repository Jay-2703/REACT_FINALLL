# Admin Dashboard Notification System Setup

## Overview
The admin dashboard now has a fully functional notification system that alerts admins in real-time when users make bookings.

## How It Works

### 1. **Frontend Setup**

#### NotificationDropdown Component (`src/components/NotificationDropdown.jsx`)
- Displays a bell icon with unread notification count
- Shows a **pulse animation** when unread notifications exist
- Unread count has a **bounce animation**
- Clicking the bell opens a dropdown with all notifications
- Notifications are categorized by type (booking_confirmation, payment_received, etc.)

#### useNotifications Hook (`src/hooks/useNotifications.js`)
- Polls the backend every **10 seconds for admins** (fast refresh)
- Polls every 30 seconds for regular users
- Fetches from `/api/notifications/admin/system` for admins
- Handles marking notifications as read
- Supports marking all notifications as read at once

#### useRealtimeNotifications Hook (`src/hooks/useRealtimeNotifications.js`)
- Connects to Socket.io server for **instant notifications**
- Falls back to polling if Socket.io isn't available
- Listens for `admin_notification` events
- Automatically triggers a refresh when new notification arrives

### 2. **Backend Setup**

#### Booking Controller (`Backend/controllers/bookingController.js`)
- When a booking is created, it triggers: `notifyAdmins()`
- Passes: booking type, message, and link to admin booking page

#### Notification Service (`Backend/services/notificationService.js`)
- `createNotification()`: Stores notifications in database
- `notifyAdmins()`: Broadcasts to all admin users
- `broadcastNotification()`: Emits Socket.io event to connected clients

#### Socket.io Config (`Backend/config/socket.js`)
- Authenticates users with JWT token
- Broadcasts notifications in real-time
- Handles disconnection and reconnection gracefully

### 3. **Database**
Notifications stored in `notifications` table with:
- `id`: Notification ID
- `user_id`: Admin user ID
- `notification_type`: Type (booking_received, booking_confirmed, etc.)
- `title`: Short notification title
- `message`: Full notification message
- `is_read`: Read status
- `created_at`: Timestamp

## Notification Flow for Bookings

```
User Makes Booking
    ↓
Backend: /api/bookings (POST)
    ↓
bookingController.js creates booking
    ↓
notifyAdmins() called with:
  - type: 'booking_received'
  - message: 'New booking from John for Vocal Recording...'
    ↓
notificationService.js:
  ├─ createNotification() → Stores in DB
  └─ broadcastNotification() → Emits Socket.io event
    ↓
Frontend Socket.io Listens to 'admin_notification' event
    ↓
Real-time notification arrives instantly
    ↓
NotificationDropdown updates:
  - Unread count increases
  - Bell icon pulses
  - New notification appears in dropdown
```

## Features Enabled

✅ **Real-time Notifications**: Socket.io integration for instant updates
✅ **Polling Fallback**: Every 10 seconds for admins if Socket.io unavailable
✅ **Visual Indicators**: 
  - Red badge with count
  - Pulse animation on bell icon
  - Bounce animation on count badge
✅ **Notification Types**: 
  - booking_received
  - booking_confirmed
  - payment_received
  - registration (new users)
  - And more...
✅ **Interactive**: 
  - Click notification to mark as read
  - Mark all as read button
  - View full notifications page
✅ **Responsive**: Works on all device sizes

## Testing the System

1. **Start Backend**: `npm run dev` (Backend directory)
2. **Start Frontend**: `npm run dev` (my-app directory)
3. **Login as Admin**: Navigate to Admin Dashboard
4. **Create a Booking**: 
   - Open the studio booking page (User side)
   - Complete a booking form
   - Submit booking
5. **Check Notification**: 
   - Bell icon on Admin Dashboard should show a notification count
   - Click bell to view notification
   - Should see: "New booking received from [User] for [Service]"

## Customization

### Change Notification Polling Speed
In `src/hooks/useNotifications.js`:
```javascript
// For admins: faster polling
const interval = isAdmin ? 5000 : 30000; // 5 sec for admin, 30 sec for users
```

### Add New Notification Types
In Backend, update `getNotificationIcon()` in `NotificationDropdown.jsx`:
```javascript
case 'custom_type':
  return <CustomIcon className="w-5 h-5 text-purple-400" />;
```

### Customize Notification Styling
All colors use:
- Gold accent: `#bfa45b`
- Dark background: `#2a2a2a`
- Borders: `#444`

Edit `NotificationDropdown.jsx` className for styling.

## Troubleshooting

**Problem**: Notifications not appearing
- ✓ Check backend is running: `http://localhost:5000`
- ✓ Verify authentication token in localStorage
- ✓ Check browser console for Socket.io connection errors
- ✓ Check browser Network tab for `/api/notifications/admin/system` calls

**Problem**: Notifications delayed
- ✓ If >10 seconds: Socket.io not connected, using polling (normal)
- ✓ Check Socket.io error in console
- ✓ Verify CORS settings in `Backend/config/socket.js`

**Problem**: Multiple notifications appearing
- ✓ Check that `refreshNotifications()` is debounced
- ✓ Verify Socket.io listener isn't duplicated

## API Endpoints Used

- `GET /api/notifications/admin/system` - Fetch admin notifications
- `GET /api/notifications` - Fetch user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- **Socket.io Event**: `admin_notification` - Real-time broadcast

---

**Last Updated**: November 26, 2025
**Status**: ✅ Fully Functional
