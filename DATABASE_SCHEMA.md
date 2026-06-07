# Database Schema

## User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key, generated with `cuid()` |
| `email` | String | Unique login identifier |
| `name` | String | Display name |
| `passwordHash` | String | Hashed password |
| `role` | Role | `USER` or `ADMIN` |
| `bio` | String? | Optional user introduction |
| `avatarUrl` | String? | Optional profile image URL |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

## Role

```prisma
enum Role {
  USER
  ADMIN
}
```

## Post

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `title` | String | Post title |
| `content` | String | Post body |
| `authorId` | String | References `User.id` |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

## Comment

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `content` | String | Comment body |
| `postId` | String | References `Post.id` |
| `authorId` | String | References `User.id` |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

## Relations

```txt
User 1 ── * Post
User 1 ── * Comment
Post 1 ── * Comment
User * ── * Post through PostLike
User 1 ── * TodoProject
TodoProject 1 ── * TodoTask
User 1 ── * CartItem
Product 1 ── * CartItem
User 1 ── * Order
Order 1 ── * OrderItem
Product 1 ── * OrderItem
Post 1 ── * PostAttachment
User 1 ── * Notification
```

## PostLike

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `postId` | String | References `Post.id` |
| `userId` | String | References `User.id` |
| `createdAt` | DateTime | Created timestamp |

`postId` and `userId` are unique together, so a user can like the same post only once.

## PostAttachment

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `postId` | String | References `Post.id` |
| `fileName` | String | Original file name |
| `mimeType` | String | Uploaded file MIME type |
| `size` | Int | File size in bytes |
| `dataUrl` | String | Small file content stored as a data URL |
| `createdAt` | DateTime | Created timestamp |

## TodoProject

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `name` | String | Project name |
| `description` | String? | Optional project description |
| `ownerId` | String | References `User.id` |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

## Product

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `name` | String | Product name |
| `description` | String? | Optional product description |
| `price` | Int | Price in KRW |
| `stock` | Int | Available stock |
| `isActive` | Boolean | Whether product is visible for sale |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

## CartItem

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `userId` | String | References `User.id` |
| `productId` | String | References `Product.id` |
| `quantity` | Int | Cart quantity |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

`userId` and `productId` are unique together, so a user has one cart row per product.

## Order

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `userId` | String | References `User.id` |
| `status` | OrderStatus | `PENDING`, `PAID`, `SHIPPED`, or `CANCELLED` |
| `totalAmount` | Int | Total order amount in KRW |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

## OrderItem

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `orderId` | String | References `Order.id` |
| `productId` | String | References `Product.id` |
| `productName` | String | Product name snapshot |
| `unitPrice` | Int | Unit price snapshot |
| `quantity` | Int | Ordered quantity |
| `subtotal` | Int | `unitPrice * quantity` |

## Notification

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `userId` | String | References `User.id` |
| `type` | NotificationType | `COMMENT`, `ORDER`, `SECURITY`, or `SYSTEM` |
| `title` | String | Short notification title |
| `message` | String | Notification body |
| `link` | String? | Optional app URL |
| `readAt` | DateTime? | Null means unread |
| `createdAt` | DateTime | Created timestamp |

## Optimization Indexes

- `Product(isActive, price)` supports shop stock/sale filters with price sorting.
- `Order(userId, createdAt)` supports user order history.
- `Notification(userId, readAt)` supports unread notification counts.
- `Notification(userId, createdAt)` supports recent notification lists.

## TodoTask

| Field | Type | Notes |
| --- | --- | --- |
| `id` | String | Primary key |
| `title` | String | Task title |
| `description` | String? | Optional memo |
| `dueDate` | DateTime? | Optional due date |
| `status` | TaskStatus | `TODO`, `IN_PROGRESS`, or `DONE` |
| `projectId` | String | References `TodoProject.id` |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |
