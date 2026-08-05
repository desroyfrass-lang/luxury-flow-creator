# Plan: Page Feedback Widgets

## Goal
Add a customer-friendly feedback widget on key pages so visitors and the owner can:
- Mark a page as helpful or not helpful
- Report an issue with the page

## What will be built

### 1. Database table
Create a `public.page_feedback` table:
- `id` (uuid, primary key)
- `page_path` (text, the page URL)
- `page_title` (text, optional)
- `helpful` (boolean, nullable: true = helpful, false = not helpful)
- `issue_text` (text, nullable, the user's report)
- `user_id` (uuid, nullable, references auth.users)
- `created_at` (timestamptz, default now())

RLS policy: users can insert their own feedback; only admins/service_role can read all rows.

### 2. Feedback component
Create `src/components/page-feedback.tsx`:
- Compact bar at the bottom of the page
- "Was this helpful?" with thumbs-up and thumbs-down buttons
- After voting, show a short "Thanks for your feedback" message
- "Report an issue" link that expands a small textarea
- Submit issue button stores the report
- Anonymous-friendly: works whether the user is signed in or not

### 3. Server function
Create `src/lib/feedback.functions.ts`:
- `submitPageFeedback` createServerFn to insert feedback
- Reads page path, helpful flag, and optional issue text

### 4. Placement on key pages
Add the `<PageFeedback />` component to:
- Product detail page (`src/routes/product.$handle.tsx`)
- Checkout page (`src/routes/checkout.tsx`)
- Onboarding / Builder Journey page (`src/routes/onboarding.tsx`)
- Workspace pages (`src/routes/_authenticated/workspace*.tsx`)
- Frassy page (`src/routes/frassy.tsx`)
- Main landing/store index pages (`/frass-kicks`, `/frass-drip`, `/bare-drip`, `/afro-designers`, `/capsules`, `/social-media-virals`)
- Blog, lookbook, and music/media pages

### 5. Admin view (optional follow-up)
A simple admin report at `/admin/feedback` listing recent feedback with page path, vote, and issue text. This can be added in the same implementation if scope allows.

## Out of scope
- Email notifications for new feedback
- Sentiment analysis
- Public display of feedback counts

## Acceptance criteria
- [ ] Thumbs-up/thumbs-down buttons appear on all listed key pages
- [ ] Clicking a button records the vote and shows a thank-you message
- [ ] "Report an issue" expands a textarea and submits text feedback
- [ ] Anonymous visitors can submit feedback
- [ ] Feedback data is visible in the database/admin
- [ ] UI matches the dark streetwear Frass brand style
