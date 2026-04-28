# BioBeats — Socket.IO Real-Time Documentation

> **Version:** 1.0.0  
> **Protocol:** Socket.IO v4  
> **Transport:** WebSocket (with HTTP long-polling fallback)  
> **Base URL:** `https://api.biobeats.com` (production) · `http://localhost:5000` (local)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Connection & Authentication](#2-connection--authentication)
3. [Connection Lifecycle](#3-connection-lifecycle)
4. [Room System](#4-room-system)
5. [Events Reference — Client → Server](#5-events-reference--client--server)
   - [join_chat](#51-join_chat)
   - [leave_chat](#52-leave_chat)
   - [mark_as_delivered](#53-mark_as_delivered)
   - [typing](#54-typing)
   - [stop_typing](#55-stop_typing)
6. [Events Reference — Server → Client](#6-events-reference--server--client)
   - [receive_message](#61-receive_message)
   - [message_edited](#62-message_edited)
   - [message_deleted_everyone](#63-message_deleted_everyone)
   - [messages_delivered](#64-messages_delivered)
   - [messages_read](#65-messages_read)
   - [user_typing](#66-user_typing)
   - [user_stopped_typing](#67-user_stopped_typing)
   - [new_notification](#68-new_notification)
   - [notification_read](#69-notification_read)
   - [all_notifications_read](#610-all_notifications_read)
   - [notification_deleted](#611-notification_deleted)
7. [Offline Message Delivery (Auto-Sweep)](#7-offline-message-delivery-auto-sweep)
8. [Error Handling](#8-error-handling)
9. [Full Integration Example](#9-full-integration-example)
10. [Event Quick-Reference Table](#10-event-quick-reference-table)
11. [Connection State Machine](#11-connection-state-machine)
12. [Best Practices & Important Notes](#12-best-practices--important-notes)

---

## 1. Overview

BioBeats uses **Socket.IO v4** to power all real-time features across the platform. Every connected client maintains a persistent WebSocket connection that enables:

| Feature | What it powers |
|---|---|
| **Direct Messaging** | Instant message delivery, edit & delete in real time |
| **Delivery Receipts** | Single-tick (sent) → double-tick (delivered) → blue-tick (read) |
| **Typing Indicators** | Live "User is typing…" feedback |
| **Notifications** | Instant push of likes, reposts, comments, follows, and system alerts |
| **Offline Catch-up** | Messages sent while the user was offline are upgraded to `delivered` on reconnect |

> **Architecture note:** The server uses a **fan-out on write** model. When a message or notification is created via the REST API, the server emits the corresponding Socket.IO event immediately to any connected recipient. The frontend does **not** need to poll.

---

## 2. Connection & Authentication

### 2.1 Establishing the Connection

Authentication is **required** before the socket handshake completes. Pass the JWT access token either as an `auth` object or as an `Authorization` header.

#### Method A — Auth Object (Recommended for web apps)

```javascript
import { io } from 'socket.io-client';

const socket = io('https://api.biobeats.com', {
  auth: {
    token: '<YOUR_JWT_ACCESS_TOKEN>'
  },
  transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

#### Method B — Authorization Header

```javascript
const socket = io('https://api.biobeats.com', {
  extraHeaders: {
    Authorization: 'Bearer <YOUR_JWT_ACCESS_TOKEN>'
  }
});
```

### 2.2 Token Refresh

The JWT access token expires after **15 minutes**. When the access token is refreshed via `POST /api/auth/refresh`, you must reconnect the socket with the new token.

```javascript
async function refreshAndReconnect() {
  const { token } = await refreshAccessToken(); // Your REST call

  // Disconnect existing socket cleanly
  socket.disconnect();

  // Reconnect with the new token
  socket.auth = { token };
  socket.connect();
}
```

### 2.3 What Happens on Failed Authentication

If the token is missing or invalid, the server rejects the connection with an error event before the `connect` event fires. The client will receive a `connect_error` event.

```javascript
socket.on('connect_error', (err) => {
  if (err.message === 'Authentication error: No token') {
    // Redirect to login
  }
  if (err.message === 'Authentication error: Invalid token') {
    // Token expired — attempt refresh
    refreshAndReconnect();
  }
});
```

---

## 3. Connection Lifecycle

```
Client                          Server
  |                               |
  |--- connect (with JWT) ------->|
  |                               |--- verify JWT
  |                               |--- auto-sweep offline messages
  |<-- connect (success) ---------|
  |                               |
  |<-- [offline messages marked]--|  (messages_delivered may fire to senders)
  |                               |
  |--- join_chat (conversationId) |
  |<-- [chat events stream] ------|
  |                               |
  |--- leave_chat (conversationId)|
  |                               |
  |--- disconnect --------------->|
  |                               |--- remove from connectedUsers map
```

### 3.1 Connect Event

```javascript
socket.on('connect', () => {
  console.log('Connected. Socket ID:', socket.id);
  // Safe to join rooms and set up listeners here
});
```

### 3.2 Disconnect Event

```javascript
socket.on('disconnect', (reason) => {
  // reason examples: 'transport close', 'io server disconnect', 'ping timeout'
  console.log('Disconnected:', reason);

  if (reason === 'io server disconnect') {
    // Server forcefully disconnected — do not auto-reconnect,
    // check authentication and reconnect manually
    socket.connect();
  }
  // For all other reasons, Socket.IO auto-reconnects if reconnection: true
});
```

### 3.3 Reconnect Events

```javascript
socket.io.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempt(s)');
  // Re-join any rooms that were active before disconnect
  if (activeConversationId) {
    socket.emit('join_chat', { conversationId: activeConversationId });
  }
});

socket.io.on('reconnect_attempt', (attemptNumber) => {
  console.log('Reconnection attempt', attemptNumber);
});

socket.io.on('reconnect_failed', () => {
  console.error('All reconnection attempts failed');
  // Show the user a "No connection" banner
});
```

---

## 4. Room System

The server uses two types of rooms. You do not join them manually — the server handles them automatically or via explicit events.

| Room Name | Joined By | Purpose |
|---|---|---|
| `user_{userId}` | Server — automatic on connect | Receives personal events (notifications, delivery receipts) |
| `chat_{conversationId}` | Client — via `join_chat` event | Receives events for a specific conversation |

> **Important:** The `user_{userId}` room is joined **automatically** by the server when the connection is authenticated. You never emit a `join_user_room` event yourself. You only need to manage `chat_{conversationId}` rooms manually.

---

## 5. Events Reference — Client → Server

These are events **you emit** from the frontend to the server.

---

### 5.1 `join_chat`

Join a conversation room to start receiving real-time message events for that conversation. Call this when the user opens a chat window.

**Emit:**

```javascript
socket.emit('join_chat', {
  conversationId: '507f1f77bcf86cd799439300'
});
```

**Payload:**

| Field | Type | Required | Description |
|---|---|---|---|
| `conversationId` | `string` (MongoId) | Yes | The conversation to join |

**Side effects on the server:** The server logs that the user opened this chat. The delivery sweep (`mark_as_delivered`) is expected to be called separately by the client after joining.

**Example — open chat:**

```javascript
function openChat(conversationId) {
  socket.emit('join_chat', { conversationId });

  // After joining, mark existing messages as delivered
  socket.emit('mark_as_delivered', { conversationId });
}
```

---

### 5.2 `leave_chat`

Leave a conversation room when the user closes or navigates away from a chat window. This stops the client from receiving chat-specific events for that conversation.

**Emit:**

```javascript
socket.emit('leave_chat', {
  conversationId: '507f1f77bcf86cd799439300'
});
```

**Payload:**

| Field | Type | Required | Description |
|---|---|---|---|
| `conversationId` | `string` (MongoId) | Yes | The conversation to leave |

**Example — close chat:**

```javascript
function closeChat(conversationId) {
  socket.emit('leave_chat', { conversationId });
}

// Also call this on component unmount / route change
useEffect(() => {
  return () => closeChat(conversationId);
}, []);
```

---

### 5.3 `mark_as_delivered`

Tell the server to upgrade all `sent` messages in a conversation to `delivered` for the current user. Also notifies the **sender** via a `messages_delivered` event so their UI can display double ticks immediately.

Call this as soon as the user opens a chat (has the conversation visible on screen).

**Emit:**

```javascript
socket.emit('mark_as_delivered', {
  conversationId: '507f1f77bcf86cd799439300'
});
```

**Payload:**

| Field | Type | Required | Description |
|---|---|---|---|
| `conversationId` | `string` (MongoId) | Yes | The conversation whose messages should be marked delivered |

**Server behavior:**
1. Updates all `status: 'sent'` messages sent **by the other person** to `status: 'delivered'`.
2. Emits `messages_delivered` back to the original sender if they are online.

**Error response:**

```javascript
socket.on('error', (err) => {
  // { message: 'Failed to mark messages as delivered' }
  console.error(err.message);
});
```

**Full pattern — open chat with delivery:**

```javascript
socket.emit('join_chat', { conversationId });
socket.emit('mark_as_delivered', { conversationId });
```

---

### 5.4 `typing`

Notify the other participant that the current user is typing. Emit this on every `keydown` event (debounced — do not emit on every single keystroke).

**Emit:**

```javascript
socket.emit('typing', {
  receiverId: '507f1f77bcf86cd799439033'
});
```

**Payload:**

| Field | Type | Required | Description |
|---|---|---|---|
| `receiverId` | `string` (MongoId) | Yes | The user ID of the person who should see the typing indicator |

**Recommended implementation (debounced):**

```javascript
let typingTimeout = null;

function handleKeyDown() {
  socket.emit('typing', { receiverId: otherUserId });

  // Auto-stop after 2 seconds of inactivity
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing', { receiverId: otherUserId });
  }, 2000);
}

inputElement.addEventListener('keydown', handleKeyDown);
```

---

### 5.5 `stop_typing`

Notify the other participant that the current user has stopped typing. Emit when the user clears the input, sends the message, or after an inactivity timeout.

**Emit:**

```javascript
socket.emit('stop_typing', {
  receiverId: '507f1f77bcf86cd799439033'
});
```

**Payload:**

| Field | Type | Required | Description |
|---|---|---|---|
| `receiverId` | `string` (MongoId) | Yes | The user ID of the person whose typing indicator should be cleared |

**When to emit:**
- After sending a message (clear the input + stop typing)
- After 2 seconds of no keystrokes (see debounce example above)
- When the user clears the input field

---

## 6. Events Reference — Server → Client

These are events **you listen for** on the frontend. The server emits them automatically.

---

### 6.1 `receive_message`

Fired when someone sends you a new direct message and you are **online**. The message has already been saved to the database at this point.

**Listen:**

```javascript
socket.on('receive_message', (message) => {
  console.log('New message received:', message);
  addMessageToConversation(message);
});
```

**Payload shape:**

```json
{
  "_id": "507f1f77bcf86cd799439200",
  "conversationId": "507f1f77bcf86cd799439300",
  "senderId": "507f1f77bcf86cd799439033",
  "content": "Hey, check out this track!",
  "attachment": {
    "type": "track",
    "referenceId": "507f1f77bcf86cd799439022"
  },
  "status": "delivered",
  "isEdited": false,
  "isDeleted": false,
  "createdAt": "2025-04-25T10:00:00.000Z",
  "updatedAt": "2025-04-25T10:00:00.000Z"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `_id` | `string` | Message MongoDB ObjectId |
| `conversationId` | `string` | The conversation this message belongs to |
| `senderId` | `string` | The user who sent the message |
| `content` | `string \| null` | Message text (null if attachment-only) |
| `attachment` | `object \| null` | Attached track or playlist (null if text-only) |
| `attachment.type` | `"track" \| "playlist"` | Type of the attached entity |
| `attachment.referenceId` | `string` | MongoId of the attached track or playlist |
| `status` | `"delivered"` | Always `delivered` when received in real time (server upgrades it) |
| `isEdited` | `boolean` | Whether the message has been edited |
| `isDeleted` | `boolean` | Always `false` for new messages |
| `createdAt` | `string` (ISO 8601) | Message creation timestamp |
| `updatedAt` | `string` (ISO 8601) | Last update timestamp |

> **Note:** When this event fires, immediately call `mark_as_delivered` if the conversation is open, so the sender sees the double-tick.

---

### 6.2 `message_edited`

Fired when a message you can see has been edited by its sender (within 15 minutes of sending). Update the message in your local state.

**Listen:**

```javascript
socket.on('message_edited', (message) => {
  updateMessageInConversation(message._id, {
    content: message.content,
    isEdited: message.isEdited
  });
});
```

**Payload shape:**

```json
{
  "_id": "507f1f77bcf86cd799439200",
  "conversationId": "507f1f77bcf86cd799439300",
  "senderId": "507f1f77bcf86cd799439033",
  "content": "Hey, check out this updated link!",
  "isEdited": true,
  "isDeleted": false,
  "status": "read",
  "createdAt": "2025-04-25T10:00:00.000Z",
  "updatedAt": "2025-04-25T10:08:00.000Z"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `_id` | `string` | Message ID to find and update in local state |
| `content` | `string` | The new edited content |
| `isEdited` | `boolean` | Always `true` |
| `updatedAt` | `string` (ISO 8601) | Time of edit |

---

### 6.3 `message_deleted_everyone`

Fired when a sender unsends a message within 15 minutes of sending. The message content is replaced with `"This message was deleted"` and `isDeleted` is set to `true`. Update your local state accordingly — do not remove the message from the UI, replace its content with the deleted placeholder.

**Listen:**

```javascript
socket.on('message_deleted_everyone', (message) => {
  updateMessageInConversation(message._id, {
    content: 'This message was deleted',
    isDeleted: true,
    attachment: null
  });
});
```

**Payload shape:**

```json
{
  "_id": "507f1f77bcf86cd799439200",
  "conversationId": "507f1f77bcf86cd799439300",
  "senderId": "507f1f77bcf86cd799439033",
  "content": "This message was deleted",
  "attachment": null,
  "isEdited": false,
  "isDeleted": true,
  "status": "read",
  "createdAt": "2025-04-25T10:00:00.000Z",
  "updatedAt": "2025-04-25T10:12:00.000Z"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `_id` | `string` | Message ID to update in local state |
| `content` | `string` | Always `"This message was deleted"` |
| `attachment` | `null` | Always cleared on deletion |
| `isDeleted` | `boolean` | Always `true` |

> **UI guidance:** Show the deleted message as a greyed-out italic placeholder: *"This message was deleted"*. Do not remove it from the thread.

---

### 6.4 `messages_delivered`

Fired to the **original sender** when the recipient comes online or opens the conversation and their messages are upgraded from `sent` → `delivered`. Use this to show double grey ticks (✓✓) in the sender's UI.

**Listen:**

```javascript
socket.on('messages_delivered', ({ conversationId, deliveredAt }) => {
  // Update all messages in this conversation that have status 'sent'
  // to status 'delivered'
  markConversationMessagesAsDelivered(conversationId, deliveredAt);
});
```

**Payload shape:**

```json
{
  "conversationId": "507f1f77bcf86cd799439300",
  "deliveredAt": "2025-04-25T10:05:00.000Z"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `conversationId` | `string` | The conversation where delivery happened |
| `deliveredAt` | `string` (ISO 8601) | Timestamp of delivery |

> **Tip:** When this event fires, update the status of all messages in that conversation that have `status === 'sent'` to `status === 'delivered'` in your local state.

---

### 6.5 `messages_read`

Fired to the **original sender** when the recipient marks messages as read via `PATCH /api/messages/conversations/{id}/read`. Use this to show blue read ticks (✓✓ in blue) in the sender's UI.

**Listen:**

```javascript
socket.on('messages_read', ({ conversationId }) => {
  // Update all messages in this conversation that have status 'delivered'
  // to status 'read'
  markConversationMessagesAsRead(conversationId);
});
```

**Payload shape:**

```json
{
  "conversationId": "507f1f77bcf86cd799439300"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `conversationId` | `string` | The conversation where all messages are now read |

---

### 6.6 `user_typing`

Fired when another user starts typing in a conversation with you. Show a typing indicator (e.g., animated dots) in the chat UI.

**Listen:**

```javascript
socket.on('user_typing', ({ senderId }) => {
  showTypingIndicator(senderId);
});
```

**Payload shape:**

```json
{
  "senderId": "507f1f77bcf86cd799439033"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `senderId` | `string` | The user ID of the person who is typing |

> **UI guidance:** Start a timeout (e.g., 3 seconds). If `user_stopped_typing` does not arrive within that window, hide the indicator automatically as a safety net.

---

### 6.7 `user_stopped_typing`

Fired when another user stops typing. Hide the typing indicator.

**Listen:**

```javascript
socket.on('user_stopped_typing', ({ senderId }) => {
  hideTypingIndicator(senderId);
});
```

**Payload shape:**

```json
{
  "senderId": "507f1f77bcf86cd799439033"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `senderId` | `string` | The user ID of the person who stopped typing |

---

### 6.8 `new_notification`

Fired whenever the server creates a new notification for the authenticated user. This covers likes, reposts, comments, follows, new track uploads, messages, mentions, and system broadcasts.

**Listen:**

```javascript
socket.on('new_notification', (notification) => {
  addNotificationToFeed(notification);
  incrementUnreadBadge();
});
```

**Payload shape:**

```json
{
  "_id": "507f1f77bcf86cd799439400",
  "recipient": "507f1f77bcf86cd799439011",
  "actors": [
    {
      "_id": "507f1f77bcf86cd799439033",
      "displayName": "Fan One",
      "avatarUrl": "https://blob/avatars/fan1.jpg"
    }
  ],
  "actorCount": 5,
  "type": "LIKE",
  "target": {
    "_id": "507f1f77bcf86cd799439022",
    "title": "Midnight Groove",
    "permalink": "midnight-groove",
    "artworkUrl": "https://blob/artworks/artwork-456.jpg"
  },
  "targetModel": "Track",
  "contentSnippet": null,
  "isRead": false,
  "actionLink": null,
  "createdAt": "2025-04-25T10:00:00.000Z",
  "updatedAt": "2025-04-25T10:00:00.000Z"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `_id` | `string` | Notification ID |
| `recipient` | `string` | The user this notification belongs to (you) |
| `actors` | `array` | Up to 3 users involved (e.g., people who liked) |
| `actors[].displayName` | `string` | Actor's display name |
| `actors[].avatarUrl` | `string` | Actor's avatar URL |
| `actorCount` | `integer` | Total number of actors (may exceed 3 for grouped notifications) |
| `type` | `string` | Notification type — see table below |
| `target` | `object \| null` | The entity this notification is about |
| `target.title` | `string` | Track/playlist title (if applicable) |
| `target.permalink` | `string` | Entity permalink for deep linking |
| `target.artworkUrl` | `string` | Artwork for display |
| `targetModel` | `string` | `"Track"`, `"Playlist"`, `"User"`, `"Comment"`, `"Message"` |
| `contentSnippet` | `string \| null` | Short preview text (e.g., first 50 chars of a comment) |
| `isRead` | `boolean` | Always `false` when first received |
| `actionLink` | `string \| null` | Deep-link URL for `SYSTEM` type notifications |

**Notification types:**

| `type` | When it fires | `contentSnippet` |
|---|---|---|
| `LIKE` | Someone likes your track or playlist | `null` |
| `REPOST` | Someone reposts your track or playlist | `null` |
| `COMMENT` | Someone comments on your track | First 50 chars of the comment |
| `FOLLOW` | Someone follows you | `null` |
| `MESSAGE` | You receive a new direct message | First 50 chars of the message |
| `NEW_TRACK` | An artist you follow uploads a track | `null` |
| `NEW_PLAYLIST` | An artist you follow creates a playlist | `null` |
| `MENTION` | Someone mentions you (@permalink) in a comment | `null` |
| `SYSTEM` | Platform broadcast from admins | The broadcast message |

**Grouped notification display logic:**

```javascript
function buildNotificationText(notification) {
  const { actors, actorCount, type, contentSnippet } = notification;
  const firstName = actors[0]?.displayName ?? 'Someone';
  const othersCount = actorCount - 1;
  const actorLabel = othersCount > 0
    ? `${firstName} and ${othersCount} other${othersCount > 1 ? 's' : ''}`
    : firstName;

  const actionMap = {
    LIKE:         `${actorLabel} liked your track`,
    REPOST:       `${actorLabel} reposted your track`,
    COMMENT:      `${actorLabel} commented: "${contentSnippet}"`,
    FOLLOW:       `${actorLabel} started following you`,
    MESSAGE:      `${actorLabel}: "${contentSnippet}"`,
    NEW_TRACK:    `${actorLabel} uploaded a new track`,
    NEW_PLAYLIST: `${actorLabel} created a new playlist`,
    MENTION:      `${actorLabel} mentioned you in a comment`,
    SYSTEM:       contentSnippet,
  };

  return actionMap[type] ?? 'You have a new notification';
}
```

---

### 6.9 `notification_read`

Fired when a specific notification is marked as read via `PATCH /api/notifications/{id}/read`. Update the notification's `isRead` status in local state and decrement the badge counter.

**Listen:**

```javascript
socket.on('notification_read', ({ notificationId }) => {
  markNotificationAsRead(notificationId);
  decrementUnreadBadge();
});
```

**Payload shape:**

```json
{
  "notificationId": "507f1f77bcf86cd799439400"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `notificationId` | `string` | The ID of the notification that was read |

---

### 6.10 `all_notifications_read`

Fired when the user marks all notifications as read via `PATCH /api/notifications/mark-read`. Set all notifications to `isRead: true` and reset the unread badge to `0`. This is useful for multi-device sync — if the user reads all notifications on mobile, the web client updates immediately.

**Listen:**

```javascript
socket.on('all_notifications_read', () => {
  markAllNotificationsAsRead();
  resetUnreadBadge();
});
```

**Payload:** None.

---

### 6.11 `notification_deleted`

Fired when a specific notification is deleted via `DELETE /api/notifications/{id}`. Remove it from the local notification feed.

**Listen:**

```javascript
socket.on('notification_deleted', ({ notificationId }) => {
  removeNotificationFromFeed(notificationId);
});
```

**Payload shape:**

```json
{
  "notificationId": "507f1f77bcf86cd799439400"
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `notificationId` | `string` | The ID of the notification to remove |

---

## 7. Offline Message Delivery (Auto-Sweep)

When a user **connects** (or reconnects) to the socket, the server **automatically** runs an offline catch-up sweep before the client receives any events. No action is required from the frontend — this happens transparently.

**What the server does on connection:**

1. Finds all conversations the user participates in.
2. Looks for any messages with `status: 'sent'` that were addressed to this user while they were offline.
3. Upgrades those messages to `status: 'delivered'` in the database.
4. Emits `messages_delivered` to the **original senders** of those messages (if those senders are currently online), so their UI updates to show double ticks.

**Frontend implication:** After your socket connects, you may see `messages_delivered` events fire shortly after — this is expected and means offline messages have been processed. Make sure your `messages_delivered` handler is registered **before** calling `socket.connect()`.

```javascript
// Register all handlers BEFORE connecting
socket.on('messages_delivered', ({ conversationId }) => {
  markConversationMessagesAsDelivered(conversationId);
});

// THEN connect
socket.connect();
```

---

## 8. Error Handling

### 8.1 Socket-Level Errors

```javascript
socket.on('error', (err) => {
  // { message: 'Failed to mark messages as delivered' }
  console.error('Socket error:', err.message);
});
```

### 8.2 Connection Errors

```javascript
socket.on('connect_error', (err) => {
  switch (err.message) {
    case 'Authentication error: No token':
      redirectToLogin();
      break;
    case 'Authentication error: Invalid token':
      refreshAndReconnect();
      break;
    default:
      showNetworkErrorBanner();
  }
});
```

### 8.3 Handling Duplicate Events

In rare reconnection scenarios, the client may receive duplicate `receive_message` events. Guard against this by checking if the message ID already exists in local state before inserting.

```javascript
socket.on('receive_message', (message) => {
  const alreadyExists = messages.some(m => m._id === message._id);
  if (!alreadyExists) {
    addMessageToConversation(message);
  }
});
```

---

## 9. Full Integration Example

A complete, production-ready socket setup covering all events.

```javascript
import { io } from 'socket.io-client';

class BioBeatsSocket {
  constructor(token) {
    this.socket = null;
    this.token = token;
    this.activeConversationId = null;
    this.typingTimeout = null;
  }

  connect() {
    // ── 1. Create socket instance ─────────────────────────────────────────
    this.socket = io('https://api.biobeats.com', {
      auth: { token: this.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // ── 2. Connection lifecycle ───────────────────────────────────────────
    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket.id);
      if (this.activeConversationId) {
        this.joinChat(this.activeConversationId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      if (err.message.includes('Invalid token')) {
        this.handleTokenExpiry();
      }
    });

    this.socket.io.on('reconnect', () => {
      console.log('[Socket] Reconnected');
    });

    // ── 3. Messaging events ───────────────────────────────────────────────
    this.socket.on('receive_message', (message) => {
      const alreadyExists = this.messageExists(message._id);
      if (!alreadyExists) {
        this.onNewMessage(message);
        if (this.activeConversationId === message.conversationId) {
          this.socket.emit('mark_as_delivered', {
            conversationId: message.conversationId
          });
        }
      }
    });

    this.socket.on('message_edited', (message) => {
      this.onMessageEdited(message);
    });

    this.socket.on('message_deleted_everyone', (message) => {
      this.onMessageDeleted(message);
    });

    // ── 4. Delivery & read receipt events ─────────────────────────────────
    this.socket.on('messages_delivered', ({ conversationId, deliveredAt }) => {
      this.onMessagesDelivered(conversationId, deliveredAt);
    });

    this.socket.on('messages_read', ({ conversationId }) => {
      this.onMessagesRead(conversationId);
    });

    // ── 5. Typing indicator events ────────────────────────────────────────
    this.socket.on('user_typing', ({ senderId }) => {
      this.onUserTyping(senderId);
    });

    this.socket.on('user_stopped_typing', ({ senderId }) => {
      this.onUserStoppedTyping(senderId);
    });

    // ── 6. Notification events ────────────────────────────────────────────
    this.socket.on('new_notification', (notification) => {
      this.onNewNotification(notification);
    });

    this.socket.on('notification_read', ({ notificationId }) => {
      this.onNotificationRead(notificationId);
    });

    this.socket.on('all_notifications_read', () => {
      this.onAllNotificationsRead();
    });

    this.socket.on('notification_deleted', ({ notificationId }) => {
      this.onNotificationDeleted(notificationId);
    });

    // ── 7. Generic error handler ──────────────────────────────────────────
    this.socket.on('error', (err) => {
      console.error('[Socket] Error:', err.message);
    });
  }

  // ── Client → Server emitters ────────────────────────────────────────────

  joinChat(conversationId) {
    this.activeConversationId = conversationId;
    this.socket.emit('join_chat', { conversationId });
    this.socket.emit('mark_as_delivered', { conversationId });
  }

  leaveChat(conversationId) {
    this.activeConversationId = null;
    this.socket.emit('leave_chat', { conversationId });
  }

  sendTyping(receiverId) {
    this.socket.emit('typing', { receiverId });
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.socket.emit('stop_typing', { receiverId });
    }, 2000);
  }

  stopTyping(receiverId) {
    clearTimeout(this.typingTimeout);
    this.socket.emit('stop_typing', { receiverId });
  }

  // ── Token refresh ───────────────────────────────────────────────────────

  async handleTokenExpiry() {
    try {
      const { token } = await refreshAccessToken();
      this.token = token;
      this.socket.auth = { token };
      this.socket.disconnect().connect();
    } catch {
      redirectToLogin();
    }
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ── Override these with your state management logic ─────────────────────
  messageExists(id) { /* check local state */ }
  onNewMessage(message) { /* add to store */ }
  onMessageEdited(message) { /* update in store */ }
  onMessageDeleted(message) { /* update in store */ }
  onMessagesDelivered(conversationId, deliveredAt) { /* update statuses */ }
  onMessagesRead(conversationId) { /* update statuses */ }
  onUserTyping(senderId) { /* show typing indicator */ }
  onUserStoppedTyping(senderId) { /* hide typing indicator */ }
  onNewNotification(notification) { /* prepend to notification list */ }
  onNotificationRead(id) { /* mark as read */ }
  onAllNotificationsRead() { /* mark all as read, reset badge */ }
  onNotificationDeleted(id) { /* remove from list */ }
}

// ── Usage ─────────────────────────────────────────────────────────────────
const bioBeatsSocket = new BioBeatsSocket(accessToken);
bioBeatsSocket.connect();

// Open a chat
bioBeatsSocket.joinChat('507f1f77bcf86cd799439300');

// User typing in input box
inputEl.addEventListener('keydown', () => {
  bioBeatsSocket.sendTyping(otherUserId);
});

// User sends message — stop typing indicator
sendButton.addEventListener('click', () => {
  bioBeatsSocket.stopTyping(otherUserId);
  // then call POST /api/messages
});

// Close chat
bioBeatsSocket.leaveChat('507f1f77bcf86cd799439300');

// Logout
bioBeatsSocket.disconnect();
```

---

## 10. Event Quick-Reference Table

### Client → Server

| Event | When to emit | Key payload fields |
|---|---|---|
| `join_chat` | User opens a chat window | `conversationId` |
| `leave_chat` | User closes/navigates away from chat | `conversationId` |
| `mark_as_delivered` | User views a conversation | `conversationId` |
| `typing` | User presses a key in the message input | `receiverId` |
| `stop_typing` | User stops typing / sends message | `receiverId` |

### Server → Client

| Event | When it fires | Key payload fields |
|---|---|---|
| `receive_message` | A new message arrives for you | Full message object |
| `message_edited` | A message in your chat is edited | `_id`, `content`, `isEdited` |
| `message_deleted_everyone` | A message in your chat is unsent | `_id`, `isDeleted: true` |
| `messages_delivered` | Your sent messages reach the recipient | `conversationId`, `deliveredAt` |
| `messages_read` | Your delivered messages are read | `conversationId` |
| `user_typing` | The other person is typing | `senderId` |
| `user_stopped_typing` | The other person stopped typing | `senderId` |
| `new_notification` | Any notification is created for you | Full notification object |
| `notification_read` | A specific notification is marked read | `notificationId` |
| `all_notifications_read` | All notifications marked read | *(none)* |
| `notification_deleted` | A notification is deleted | `notificationId` |

---

## 11. Connection State Machine

```
                    ┌─────────────┐
                    │ DISCONNECTED│◄──────────────────────────────────┐
                    └──────┬──────┘                                    │
                           │ socket.connect()                          │
                           ▼                                           │
                    ┌─────────────┐   Token invalid / missing         │
                    │ CONNECTING  ├──────────────────────────────────►│
                    └──────┬──────┘                                    │
                           │ JWT verified                              │
                           ▼                                           │
                    ┌─────────────┐   Network drop                    │
                    │  CONNECTED  ├──────────────────────┐            │
                    └──────┬──────┘                      ▼            │
                           │                    ┌──────────────┐      │
                           │                    │ RECONNECTING │      │
                           │                    └──────┬───────┘      │
                           │ socket.disconnect()       │              │
                           │                    Max attempts exceeded │
                           ▼                           ▼              │
                    ┌─────────────┐           ┌─────────────────┐     │
                    │ DISCONNECTED│           │ RECONNECT FAILED ├────►│
                    └─────────────┘           └─────────────────┘
```

---

## 12. Best Practices & Important Notes

### Register all listeners before connecting

Always attach all your event listeners before calling `socket.connect()`. Events can fire immediately after the connection handshake — if listeners are registered too late, events will be missed.

```javascript
// ✅ Correct
socket.on('receive_message', handler);
socket.on('new_notification', handler);
socket.connect();

// ❌ Wrong — may miss early events
socket.connect();
socket.on('receive_message', handler);
```

### Clean up listeners on component unmount (React)

```javascript
useEffect(() => {
  socket.on('receive_message', handleMessage);
  socket.on('user_typing', handleTyping);

  return () => {
    socket.off('receive_message', handleMessage);
    socket.off('user_typing', handleTyping);
    socket.emit('leave_chat', { conversationId });
  };
}, [conversationId]);
```

### Never send raw objects as the `receiverId`

The server casts `receiverId` to a plain string using `String()` to prevent MongoDB operator injection. The frontend should always send a plain string ID, never an object.

```javascript
// ✅ Correct
socket.emit('typing', { receiverId: '507f1f77bcf86cd799439033' });

// ❌ Wrong — will be coerced but sends unexpected format
socket.emit('typing', { receiverId: { $gt: '' } });
```

### Debounce the typing event

Do not emit `typing` on every single keystroke. Use a debounce of at least 300ms and a stop-typing auto-timeout of 2 seconds to avoid flooding the server.

### Handle the multi-tab scenario

If a user has BioBeats open in multiple tabs, each tab maintains its own socket connection. Notification and message events will fire in all tabs. Use a shared state layer (e.g., Redux, Zustand, or BroadcastChannel) to de-duplicate UI updates across tabs.

### Message status progression

Each message follows this status flow. Never skip a step.

```
sent  →  delivered  →  read
 ↑           ↑           ↑
REST      messages_   messages_
 API      delivered     read
        (socket event) (socket event)
```

### Do not trust socket events alone for message history

Socket events are **supplemental** to the REST API — they deliver real-time updates for the current session. On page load or app start, always fetch the full message history via `GET /api/messages/{conversationId}/messages` and the notification feed via `GET /api/notifications`. Use socket events to patch live updates on top of the fetched data.

---

*For REST API documentation, refer to the main OpenAPI specification file.*  
*For questions or clarifications, contact the backend team.*
