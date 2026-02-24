# LH44-INN Frontend

Minimal Next.js (TypeScript, App Router, Tailwind) frontend for the LH44-INN backend API.

## Setup

1. **Install dependencies**
  ```bash
   cd frontend && npm install
  ```
2. **Environment**
  Copy `.env.local.example` to `.env.local` and set the API URL if your backend runs elsewhere:
3. **Run the backend**
  From the project root, start the Spring Boot API (see main README). Ensure CORS allows `http://localhost:3000` (backend `FRONTEND_URL`).
4. **Run the frontend**
  ```bash
   npm run dev
  ```
   Open [http://localhost:3000](http://localhost:3000).

## Pages

- **/** — Home; link to search
- **/login** — Log in (email + password)
- **/signup** — Sign up (name, email, password)
- **/admin/signup** — Create hotel manager account (name, email, password, admin invite code)
- **/hotels** — Search hotels (city, check-in/out, rooms); results link to detail
- **/hotels/[id]** — Hotel detail, rooms, and “Book” per room
- **/book** — New booking (query: hotelId, roomId); form: dates, rooms count → POST /bookings/init
- **/bookings/[id]** — Booking detail: status, add guests, proceed to payment, cancel
- **/my-bookings** — List bookings with link to each booking detail
- **/my-guests** — List, add, edit, delete guests (GET/POST/PUT/DELETE /users/guests)
- **/profile** — View and update profile (GET/PATCH /users/profile)
- **/admin** — Redirects to /admin/hotels
- **/admin/hotels** — List admin hotels, create hotel (GET/POST /admin/hotels)
- **/admin/hotels/[id]** — Hotel detail: edit, delete, activate, report, bookings, link to rooms
- **/admin/hotels/[id]/rooms** — List rooms, add room (GET/POST)
- **/admin/hotels/[id]/rooms/[roomId]** — Edit/delete room, get/patch inventory

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Auth: access token in `localStorage`; refresh token in HTTP-only cookie (set by backend on login)
- API client in `lib/api.ts` (unwraps backend `{ data }` responses); auth context in `lib/auth-context.tsx`

