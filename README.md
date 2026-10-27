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
## Public W-9 quick requests

Enable **W9 & 1099 Chaser** for a registered domain in `/widget/mypowerly`.
Visitors can then select **W-9 Request** from the parrot widget dropdown,
continue to Quick Request, and enter their own name and email. Account/reference
number and phone are optional. The existing W-9 choice under Service Request
also opens this screen.

Requests use the validated backend's existing `POST /api/widgets/submit-form/`
endpoint with `request_w9: true`, `form_ids: []`, and the existing `name`,
`email`, `phone`, `reference_id`, `note`, `frontend_url`, and `workspace_id` fields.
The account number is sent as `reference_id`. The backend remains responsible
for domain/workspace authorization, W-9 creation, and email delivery. The widget
does not call the authenticated admin request API.

Successful responses show an email confirmation within the widget; failures
retain the visitor's details for retry. Deploy the widget build and the admin
settings change together. Verify email delivery against the configured backend
before releasing; browser checks with mocked responses do not send real email.
