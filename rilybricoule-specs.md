# RiLyBricoule Specs Reference

## Product

RiLyBricoule is a geolocated marketplace for home services in Morocco.
It connects clients with service providers for booking, chat, reviews, payments, and support.
Main channels:

- Client mobile app
- Prestataire mobile app
- Client website
- Admin back-office

Main stack in the original brief:

- Flutter for mobile apps
- Vue.js 3 for client web
- Laravel PHP for backend and admin
- SQL database
- Google Maps
- FCM notifications
- CMI plus other payment gateways

## Core Client Features

- Signup, login, profile
- Geolocated service search
- Provider profile and reviews
- Reservation request with date, time, address, note
- Payment online or cash
- Notifications
- Chat after reservation acceptance
- Cancel or modify reservation
- Coupons
- Reservation history
- Ratings and written reviews
- Favorites
- Help and support
- French and Arabic support

Important support requirement from the brief:

- Client has a support/help section
- Client can contact support by chat, email, or phone
- A ticket system may be used to track assistance requests

## Core Prestataire Features

- Dedicated prestataire signup and validation
- Manage service catalog
- Manage intervention zone
- Manage availability
- Accept or refuse requests
- Chat with client after acceptance
- Planning and reminders
- Maps itinerary
- Mission status updates
- History and revenue dashboard
- Read and reply to reviews
- Notifications
- Support contact
- French and Arabic support

Important support requirement from the brief:

- Prestataire can contact platform support
- FAQ can exist for prestataires
- This strongly supports a ticket/contact flow on prestataire side too

## Admin Features

- Dashboard and KPIs
- Manage clients
- Manage prestataires and validation
- Manage services and categories
- Moderate service content
- Track reservations
- Manage payments, commissions, invoices
- Manage coupons and campaigns
- Send notifications
- Manage information pages
- Manage support and disputes
- Roles, permissions, audit/security

Important ticket requirement from the brief:

- Admin back-office centralizes support tickets from clients and prestataires
- Admin can respond, classify, and close tickets
- Admin handles disputes and arbitration

## Ticket Module Interpretation

Based on the brief, the clean expected model is:

- Client and prestataire create support requests or tickets
- Admin views, replies, updates status, classifies, and resolves them

This means an admin-only ticket API is not enough for full spec coverage.
There should also be a user-side create flow, likely something like:

- `POST /api/support/tickets`

and admin management endpoints like:

- `GET /api/admin/tickets`
- `POST /api/admin/tickets/{id}/reply`
- `PATCH /api/admin/tickets/{id}/status`

## Phasing

Suggested project phases from the brief:

1. MVP: client app plus admin back-office
2. Prestataire app
3. Public client website
4. Optimizations and extensions

Important MVP note:

- If prestataire app is not ready, prestataires may temporarily use a restricted web/admin interface

## Working Rules For Our Merge

- Use `RilyBricoule-backend` as the target repo
- Merge admin features module by module
- Avoid replacing auth, roles, and security blindly
- Support tickets are additive and safer than auth changes
- If we want full ticket spec coverage, we need:
  - admin management endpoints
  - client or prestataire ticket creation flow

## Current Practical Conclusion

- Admin ticket management module fits the specs
- Client/prestataire ticket creation is also expected by the specs
- If missing in code, it should be added explicitly rather than assumed to exist on `develop`
