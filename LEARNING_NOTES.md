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
