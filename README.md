# MyPowerly Widget

A customer service widget that provides service requests, AI chatbot, and live chat functionality.

## Getting Started

- `npm install`
- `npm run dev`

## Features

- **Service Request Forms** - Submit requests for various services with form validation
- **AI Chatbot** - Interactive AI assistance (coming soon)
- **Live Chat** - Real-time customer support via embedded chat
- **Widget Validation** - Domain-based access control and configuration

## Tech Stack

- React 19 with Vite
- Tailwind CSS for styling
- WebSocket/iframe integration for live chat
- REST API integration with MyPowerly backend

## Widget Integration

Add to your website:
```html
<script src="https://your-domain.com/w9-widget/widget.js?id=YOUR_WIDGET_ID"></script>
```

## Configuration

Widget behavior is controlled via MyPowerly admin panel:
- Enable/disable services (forms, chatbot, live chat)
- Configure available form types
- Set chat widget URLs
- Manage domain whitelist

## Build

- `npm run build` - Creates production build
- `npm run preview` - Preview production build

## Public tax form requests

Enable W9 & 1099 Chaser for a registered site. The **Tax Form Request** menu
opens a dynamic form selector populated by the public validation response's
`form_definitions`, with optional `vendor_types` and `compliance_packets`.
New submissions send `form_definition_id` and its `tax_year`, without the legacy
`request_w9` flag. Empty definition lists disable submission.

Public packet summaries do not need a `show_in_widget` field: the backend
returns only permitted choices and enforces workflow publication itself.

Stale selections refresh settings and require explicit reselection while
preserving visitor details. A sent confirmation requires `email_sent: true`.
Existing service forms continue using `form_ids` and their required fields.

See [the current frontend contract](docs/PUBLIC_WIDGET_FRONTEND_CONTRACT.md)
for payloads, response handling, and test coverage. Run `npm test` for the
public tax selection/response contract tests.
