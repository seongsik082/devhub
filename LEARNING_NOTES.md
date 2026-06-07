# Learning Notes

This file stores the backend skills we learn while building DevHub.

## Milestone 1: Authentication

### Why Authentication Matters

Most backend systems need to know who is making a request before they can decide what data to return or mutate.

### Password Storage

- Never store raw passwords.
- This project hashes passwords with `bcryptjs`.
- Login compares the submitted password against the stored hash.

### Sessions

- After login, the server creates a signed token with `jose`.
- The token is stored in an HTTP-only cookie named `devhub_session`.
- HTTP-only cookies cannot be read by browser JavaScript, which reduces token theft risk from XSS.

### Authorization

- `src/proxy.ts` redirects unauthenticated dashboard requests to `/login`.
- `src/app/dashboard/page.tsx` also checks the session on the server.
- Important rule: proxy or middleware should not be the only authorization layer.

### Database

- `User.email` is unique.
- `passwordHash` stores the hash, not the original password.
- `role` prepares the project for a future admin page.

## Next Skills To Add

- API error handling conventions
- Integration tests for auth and board flows
- Role-based access control

## Milestone 2: Board And Comments

### Relations

- `User` has many `Post` records.
- `User` has many `Comment` records.
- `Post` has many `Comment` records.
- `Comment` belongs to both a `User` and a `Post`.

### Foreign Keys

- `Post.authorId` references `User.id`.
- `Comment.authorId` references `User.id`.
- `Comment.postId` references `Post.id`.
- Deleting a user or post cascades to related records in this learning project.

### CRUD

- Create: logged-in users can create posts and comments.
- Read: everyone can read the board and post details.
- Delete: authors and admins can delete their own posts or comments.

### Authorization

- UI buttons are hidden when the user lacks permission.
- API routes also enforce permission.
- Important rule: hiding a button is convenience, not security. The server must check again.

### Indexes

- `Post.authorId`, `Post.createdAt`, `Comment.postId`, `Comment.authorId`, and `Comment.createdAt` are indexed.
- Indexes help common queries such as listing recent posts or fetching comments for a post.

### Interaction: Likes

- `PostLike` is a join table between `User` and `Post`.
- `@@unique([postId, userId])` prevents duplicate likes.
- The like API toggles state: create when missing, delete when already present.

## Account Recovery And Password Change

### Find ID

- This project treats email as the login ID.
- The first recovery version searches by `name` and returns masked emails.
- Masking prevents the API from exposing full account identifiers to anyone who knows a name.

### Password Change

- Password change requires an authenticated session.
- The current password is verified with `bcryptjs.compare`.
- The new password is validated, confirmed twice, and hashed before saving.
- The server rejects using the same password as the current password.

### Future Improvement

- A full "forgot password" flow should send a short-lived reset token by email.
- That requires an email provider such as Resend and a `PasswordResetToken` table.

## Milestone 3: Todo Management

### User-Scoped Data

- `TodoProject.ownerId` references `User.id`.
- Every todo project query filters by the current session user.
- Task APIs verify ownership through the parent project before updating or deleting.

### Status Workflow

- `TodoTask.status` uses the `TaskStatus` enum: `TODO`, `IN_PROGRESS`, `DONE`.
- The UI exposes status as a segmented control.
- Filtering by status is done with query params such as `?status=DONE`.

### Backend Lessons

- Always verify parent ownership when mutating nested resources.
- Avoid trusting IDs from the client without checking that they belong to the logged-in user.
- Use indexes on owner, project, status, and due date for common dashboard queries.

## Home Summary And Chat Widget

### Home Todo Summary

- The home page now combines public board content with a private todo summary.
- Public data can be shown to everyone, but user-specific todos are queried only when a session exists.
- This is a common dashboard pattern: mix public discovery with private account state.

### Chat Widget

- The first chat version is rule-based and runs through `/api/chat`.
- Keeping a route handler boundary means the reply logic can later be replaced with a real LLM call without rewriting the UI.
- The widget stores messages in client state for now. Persisted chat history would need a `ChatThread` and `ChatMessage` schema.

## Weather And Admin

### Weather

- Weather is fetched from Open-Meteo without an API key.
- The app uses Seoul coordinates and caches the result for 10 minutes with `fetch` revalidation.
- The weather logic is isolated in `src/lib/weather.ts`, so another city selector can be added later.

### Admin Page

- `/admin` is protected by login and then checks `session.role === "ADMIN"` on the server.
- The admin page shows aggregate counts, recent users, and weather.
- Admin links are only shown in the home menu for users whose session role is `ADMIN`.
- Admin user management can change another user's role and reset passwords.
- The API blocks changing your own role to avoid accidentally locking out the current admin.

## Milestone 4: Shop And Orders

### Product Catalog

- `Product` stores name, description, price, stock, and sale visibility.
- `/shop` is public for browsing, but adding to cart requires login.
- Admins can create products and edit price, stock, and active status from `/admin`.

### Cart

- `CartItem` belongs to a user and product.
- `@@unique([userId, productId])` keeps one cart row per product per user.
- The add-to-cart API uses `upsert`: create when missing, increment quantity when already present.
- Quantity changes check current product stock before saving.

### Checkout Transaction

- Checkout reads all cart items, verifies sale status and stock, decrements stock, creates an order, creates order items, and clears the cart.
- Those steps run inside a Prisma transaction so partial orders are avoided.
- Stock decrement uses `updateMany` with `stock >= quantity` to reduce race-condition risk.

### Order Management

- `Order` stores status and total amount.
- `OrderItem` stores a snapshot of product name and unit price, so old orders remain understandable even if the product changes later.
- Admins can move orders through `PENDING`, `PAID`, `SHIPPED`, and `CANCELLED`.

### Backend Skills Practiced

- Relational modeling for commerce data.
- User-scoped resources and authorization checks.
- Transactional writes with stock validation.
- Admin operations separated from public user operations.
- Seed scripts for repeatable test data.

## Milestone 5: Profiles And Attachments

### Profile Management

- `User` now has optional `bio` and `avatarUrl` fields.
- `/account/profile` lets a logged-in user update display name, introduction, and profile image URL.
- After changing the name, the auth cookie is refreshed so the navbar immediately reflects the new display name.

### Post Attachments

- `PostAttachment` belongs to a post and stores file metadata plus a small `dataUrl`.
- The first version accepts images, PDF, and text files.
- Upload limits are intentionally small: up to 3 files per post and 1MB per file.
- This DB-backed approach works on Vercel because serverless local disk is not reliable persistent storage.

### Admin Visibility

- Admin metrics include attachment counts.
- The admin page lists recent uploaded files and links back to their posts.

### Backend Skills Practiced

- Multipart form handling with `request.formData()`.
- File validation by count, size, and MIME type.
- Modeling metadata separately from post content.
- Choosing storage strategy based on deployment constraints.

## Milestone 6: Search, Filters, And Pagination

### Board Search

- `/posts` accepts `q` and `page` query params.
- The server searches post title, content, and author name with Prisma `contains`.
- Results are paginated with `skip` and `take`.
- Pagination links preserve the current search query.

### Shop Filters

- `/shop` accepts `q`, `stock`, and `sort` query params.
- Product search checks name and description.
- The stock filter can show only purchasable products.
- Sorting supports newest, low price, and high price.

### Admin Operations Search

- `/admin` accepts a global `q` query and an `orderStatus` filter.
- The same search box narrows users, products, orders, and attachments.
- This matches a common admin dashboard pattern: global search plus focused status filters.

### Backend Skills Practiced

- Designing stable URL query params.
- Building dynamic Prisma `where` and `orderBy` objects.
- Combining search with pagination.
- Keeping search state shareable through URLs.

## Milestone 7: Notifications

### Notification Model

- `Notification` belongs to a user and stores type, title, message, optional link, and read timestamp.
- `NotificationType` separates events such as comments, orders, security, and system messages.
- `readAt = null` means the notification is unread.

### Event Triggers

- A new comment creates a notification for the post author, except when the author comments on their own post.
- Admin order status changes create a notification for the order owner.
- Admin password resets create a security notification for the affected user.

### User Flow

- `/notifications` lists recent notifications.
- Users can mark one notification as read or mark all unread notifications as read.
- The dashboard shows unread count and recent notifications.

### Backend Skills Practiced

- Event-driven thinking inside ordinary CRUD APIs.
- Modeling read/unread state.
- User-scoped update APIs.
- Reusing notification creation through a small helper function.

## Optimization Pass: Weather Date And Query Diet

### Weather Date

- The weather card now shows today's Seoul date and the last weather update time.
- The date is derived from Open-Meteo's `current.time` with the `Asia/Seoul` timezone.

### Query Optimization

- List pages now use Prisma `select` to fetch only fields rendered by the UI.
- Home, posts, shop, dashboard, cart, orders, notifications, and admin pages were trimmed.
- Repeated `getDb()` calls inside the same page were reduced by storing the lazy Prisma client in a local `db` variable.

### Index Optimization

- Added composite indexes for frequent access paths:
  - products filtered by `isActive` and sorted by `price`
  - orders listed by `userId` and `createdAt`
  - notifications filtered by `userId`, `readAt`, and `createdAt`

### Backend Skills Practiced

- Avoid over-fetching relational data.
- Match indexes to real query patterns.
- Keep external API data display-friendly without changing the upstream API.

## Milestone 8: Security Hardening

### Login Attempt Limiting

- Every login attempt is recorded in `LoginAttempt`.
- Failed attempts are counted by email and IP address within a 15 minute window.
- After 5 failed attempts, the login API returns `429` and asks the user to try again later.
- Successful attempts are also recorded for basic security history.

### Admin Audit Logs

- Admin actions are recorded in `AuditLog`.
- Logged actions include role changes, password resets, product creation/update, and order status changes.
- Each log stores actor, target, summary, optional metadata, IP address, user agent, and timestamp.

### Admin Security Dashboard

- `/admin` now shows recent admin audit logs.
- It also shows recent failed login attempts.
- This gives operators a quick place to spot suspicious account or admin activity.

### Backend Skills Practiced

- Rate limiting with persistent storage.
- Audit logging for privileged operations.
- Capturing request metadata from headers.
- Keeping security checks server-side instead of trusting UI state.
