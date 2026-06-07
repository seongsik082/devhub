# API Spec

## Auth

### POST `/api/auth/register`

Request:

```json
{
  "name": "Kim",
  "email": "kim@example.com",
  "password": "password123"
}
```

Success:

```json
{
  "user": {
    "id": "user_id",
    "email": "kim@example.com",
    "name": "Kim",
    "role": "USER"
  }
}
```

### POST `/api/auth/login`

Request:

```json
{
  "email": "kim@example.com",
  "password": "password123"
}
```

### POST `/api/auth/logout`

Clears the session cookie.

### GET `/api/auth/me`

Returns the current session user.

### POST `/api/auth/find-id`

Request:

```json
{
  "name": "Kim"
}
```

Success:

```json
{
  "accounts": [
    {
      "email": "kim***@example.com",
      "createdAt": "2026-06-06T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/auth/change-password`

Requires login.

Request:

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}
```

## Posts

### POST `/api/posts`

Requires login.

Request:

```json
{
  "title": "First post",
  "content": "This is the post body."
}
```

Success:

```json
{
  "post": {
    "id": "post_id",
    "title": "First post"
  }
}
```

### DELETE `/api/posts/:postId`

Requires login. Only the post author or an admin can delete.

## Comments

### POST `/api/posts/:postId/comments`

Requires login.

Request:

```json
{
  "content": "Nice post."
}
```

### DELETE `/api/posts/:postId/comments/:commentId`

Requires login. Only the comment author or an admin can delete.

### POST `/api/posts/:postId/like`

Requires login. Toggles the current user's like for the post.

Success:

```json
{
  "liked": true,
  "count": 1
}
```

## Todos

### POST `/api/todos/projects`

Requires login.

Request:

```json
{
  "name": "Backend practice",
  "description": "Milestone tasks"
}
```

### POST `/api/todos/projects/:projectId/tasks`

Requires login and project ownership.

Request:

```json
{
  "title": "Add todo feature",
  "description": "Create project and task flow",
  "dueDate": "2026-06-10"
}
```

### PATCH `/api/todos/projects/:projectId/tasks/:taskId`

Requires login and project ownership.

Request:

```json
{
  "status": "DONE"
}
```

### DELETE `/api/todos/projects/:projectId/tasks/:taskId`

Requires login and project ownership.

## Chat

### POST `/api/chat`

Request:

```json
{
  "message": "할 일은 어디서 만들어요?"
}
```

Success:

```json
{
  "reply": "..."
}
```

The current implementation is a rule-based DevHub helper. It can later be replaced with an LLM-backed response.

## Account Profile

### PATCH `/api/account/profile`

Requires login. Updates the current user's profile and refreshes the session cookie.

```json
{
  "name": "김성식",
  "bio": "백엔드 개발자를 목표로 실습 중입니다.",
  "avatarUrl": "https://example.com/avatar.png"
}
```

## Post Attachments

### POST `/api/posts`

Requires login. The endpoint accepts JSON for plain posts or `multipart/form-data` for posts with attachments.

Multipart fields:

- `title`
- `content`
- `attachments`: up to 3 files

Allowed file types:

- `image/png`
- `image/jpeg`
- `image/webp`
- `application/pdf`
- `text/plain`

Each file must be 1MB or smaller.

## Notifications

### GET `/notifications`

Requires login. Shows the current user's notifications.

### PATCH `/api/notifications/:notificationId/read`

Requires login and notification ownership. Marks one notification as read.

### PATCH `/api/notifications/read-all`

Requires login. Marks all unread notifications for the current user as read.

## Security

### Login Rate Limiting

`POST /api/auth/login` records every login attempt. If the same email or IP has 5 failed attempts within 15 minutes, the API returns `429`.

### Admin Audit Logging

The following admin APIs create audit logs when successful:

- `PATCH /api/admin/users/:userId/role`
- `PATCH /api/admin/users/:userId/password`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:productId`
- `PATCH /api/admin/orders/:orderId`

## Shop

### POST `/api/shop/cart`

Requires login. Adds a product to the current user's cart.

```json
{
  "productId": "product-id",
  "quantity": 1
}
```

### PATCH `/api/shop/cart/:cartItemId`

Requires login and cart ownership. Updates quantity.

```json
{
  "quantity": 2
}
```

### DELETE `/api/shop/cart/:cartItemId`

Requires login and cart ownership. Removes one cart item.

### POST `/api/shop/checkout`

Requires login. Creates an order from the cart, decrements stock, creates order items, and clears the cart inside a transaction.

## Weather

### GET `/api/weather`

Returns current Seoul weather from Open-Meteo.

```json
{
  "weather": {
    "city": "서울",
    "temperature": 20.7,
    "description": "흐림"
  }
}
```

## Admin

### GET `/admin`

Requires login and `ADMIN` role. Non-admin users are redirected to `/dashboard`.

### PATCH `/api/admin/users/:userId/role`

Requires `ADMIN` role. Changes another user's role.

```json
{
  "role": "ADMIN"
}
```

### PATCH `/api/admin/users/:userId/password`

Requires `ADMIN` role. Resets a user's password.

```json
{
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}
```

### POST `/api/admin/products`

Requires `ADMIN` role. Creates a product.

```json
{
  "name": "백엔드 실습 노트",
  "description": "API 설계 노트",
  "price": 12000,
  "stock": 30,
  "isActive": true
}
```

### PATCH `/api/admin/products/:productId`

Requires `ADMIN` role. Updates product name, description, price, stock, and sale status.

### PATCH `/api/admin/orders/:orderId`

Requires `ADMIN` role. Updates an order status.

```json
{
  "status": "SHIPPED"
}
```
