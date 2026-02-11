# TheSyncBridge - Product Requirements Document

## Original Problem Statement
Build "TheSyncBridge" - A 325-day mission platform bridging Plasma Physics and Spiritual Intuition. Based on the provided PDF document, the system implements:
- Guardian registration with unique Scroll IDs
- Certificate of Guardianship
- Mission Clock tracking the 325-day journey
- Daily Transmissions content section
- Guardian Registry
- Admin panel for transmission management
- Merchandise store with personalized items

## User Choices
- Simple email-only registration (no password)
- Mission start date: February 22, 2026
- Video transmissions via links (YouTube/Vimeo URLs)
- Order request system (no payment processing - manual fulfillment)
- Simple password-protected admin panel

## User Personas
1. **Blue Guardians** - Community members who register, receive Scroll IDs, and purchase merchandise
2. **Admin/Translator** - Content creator who manages transmissions and orders

## What's Been Implemented - February 11, 2026

### Backend (FastAPI + MongoDB)
**Guardian System:**
- `/api/guardians/register` - Email registration, generates Scroll ID
- `/api/guardians/lookup` - Find guardian by email
- `/api/guardians/registry` - List all guardians
- `/api/guardians/{scroll_id}` - Get guardian by Scroll ID
- `/api/certificate/{scroll_id}` - Certificate data

**Mission System:**
- `/api/mission/status` - Current day, progress, dates

**Transmissions (Admin Protected):**
- `POST /api/transmissions` - Add transmission (admin)
- `GET /api/transmissions` - List all transmissions
- `DELETE /api/transmissions/{id}` - Remove transmission (admin)

**Merchandise & Orders:**
- `GET /api/merchandise` - Product catalog
- `POST /api/orders` - Submit order request
- `GET /api/orders` - View all orders (admin)
- `PATCH /api/orders/{id}/status` - Update order status (admin)

### Frontend (React + Tailwind)
- **Landing Page** - Hero, Mission Clock, stats
- **Registration Portal** - Email signup, Scroll ID generation
- **Certificate Page** - Official guardianship certificate
- **Transmissions Page** - Daily content with video links
- **Registry Page** - All guardians displayed
- **Store Page** - Merchandise with Scroll ID verification
  - Hoodie ($65), T-Shirt ($35), Cap ($30)
  - Personalized preview with Scroll ID
  - Cart, checkout, order submission
- **Admin Login** - Password: `syncbridge325`
- **Admin Dashboard** - Manage transmissions & orders

### Design System
- Neon Noir aesthetic (Matte Black #050505 + Electric Blue #00CCFF)
- Fonts: Rajdhani, Space Grotesk, JetBrains Mono
- Sacred geometry logo, glow effects
- Fully responsive with mobile hamburger menu

## Prioritized Backlog

### P0 (Completed)
- [x] Guardian registration with Scroll ID
- [x] Certificate display
- [x] Mission Clock (Day 0/325)
- [x] Guardian Registry
- [x] Admin panel with password auth
- [x] Transmission management (add/delete with video links)
- [x] Merchandise store with personalized previews
- [x] Order request system with shipping collection
- [x] Order management in admin dashboard
- [x] Responsive design

### P1 (Future)
- [ ] Email notifications for new orders
- [ ] Downloadable certificate PDF
- [ ] Video embed support in transmissions
- [ ] Payment processing (Stripe integration)

### P2 (Deferred)
- [ ] Circle.so community integration
- [ ] Shopify/Printful direct fulfillment
- [ ] Telegram channel integration

## Technical Notes
- Admin password: `syncbridge325` (stored in ADMIN_PASSWORD env var)
- Scroll ID format: SB-XXXX (sequential)
- Order statuses: pending, processing, shipped, delivered, cancelled
