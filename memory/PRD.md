# TheSyncBridge - Product Requirements Document

## Original Problem Statement
Build "TheSyncBridge" - A 325-day mission platform bridging Plasma Physics and Spiritual Intuition. Based on the provided PDF document, the system implements:
- Guardian registration with unique Scroll IDs
- Certificate of Guardianship
- Mission Clock tracking the 325-day journey
- Daily Transmissions content section
- Guardian Registry

## User Choices
- Simple email-only registration (no password)
- Mission start date: February 22, 2026
- Placeholder transmissions with link capability
- Recreate logo/visual style with Neon Noir theme (Matte Black + Electric Blue #00CCFF)

## User Personas
1. **Blue Guardians** - Community members who register to receive a Scroll ID and participate in the 325-day mission
2. **Admin/Translator** - Content creator who posts daily transmissions

## Core Requirements (Static)
- Scroll ID generation format: SB-XXXX (sequential)
- Certificate of Guardianship display
- Mission Clock: Day X/325 countdown from Feb 22, 2026
- Guardian Registry listing all members
- Transmissions feed with video link placeholders

## What's Been Implemented - February 11, 2026

### Backend (FastAPI + MongoDB)
- `/api/mission/status` - Returns current day, progress, dates
- `/api/guardians/register` - Email registration, generates Scroll ID
- `/api/guardians/lookup` - Find guardian by email
- `/api/guardians/registry` - List all guardians
- `/api/guardians/count` - Total guardian count
- `/api/guardians/{scroll_id}` - Get guardian by Scroll ID
- `/api/certificate/{scroll_id}` - Certificate data
- `/api/transmissions` - CRUD for daily transmissions

### Frontend (React + Tailwind)
- **Landing Page** - Hero with Sacred Geometry logo, Mission Clock, CTA
- **Registration Portal** - Email signup, Scroll ID generation
- **Certificate Page** - Official guardianship certificate display
- **Transmissions Page** - Daily content feed with placeholders
- **Registry Page** - All guardians displayed
- **Lookup Page** - Find existing Scroll ID by email

### Design System
- Neon Noir aesthetic (Matte Black #050505 + Electric Blue #00CCFF)
- Fonts: Rajdhani (headings), Space Grotesk (body), JetBrains Mono (data)
- Sacred geometry logo with bridge motif
- Glow effects, geometric patterns

## Prioritized Backlog

### P0 (Completed)
- [x] Guardian registration with Scroll ID
- [x] Certificate display
- [x] Mission Clock
- [x] Guardian Registry
- [x] Transmissions placeholders

### P1 (Future)
- [ ] Admin panel for transmission management
- [ ] Email notifications on registration
- [ ] Downloadable/printable certificate PDF
- [ ] Video embed support for transmissions

### P2 (Deferred)
- [ ] Circle.so integration (external community)
- [ ] Shopify/Printful merchandise integration
- [ ] Telegram channel integration
- [ ] AI voice/image generation for transmissions

## Next Action Items
1. Add admin authentication for transmission management
2. Implement email notification system for new guardians
3. Add certificate PDF download feature
4. Enable video embed support in transmissions
