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

### Vendor type and compliance packet selectors

The Quick Request screen reads `widget_settings.vendor_types` and
`widget_settings.compliance_packets` from the domain validation response:

```json
{
  "vendor_types": [{ "slug": "vendor", "name": "Vendor" }],
  "compliance_packets": [{ "id": "packet-id", "name": "Vendor onboarding", "vendor_type": "vendor", "show_in_widget": true }]
}
```

These are the frontend integration contract for a pending backend extension.
The live public validation response did not expose these lists when checked;
the existing admin list endpoints require authentication. Until the public API
supplies choices, the widget defaults to Vendor and shows an empty packet state.
It does not fetch private workflows or invent packet choices.

W-9 submissions include `vendor_type` and, when selected, `compliance_packet_id`.
The public submit endpoint must validate those values against the registered
website's workspace and attach the selected workflow server-side. That backend
support and actual packet attachment have not been verified in this repository.
Changing vendor type chooses the first matching public packet or clears the
previous packet. Selecting no packet is allowed.

### Per-workflow widget visibility

The workflow dashboard has a separate **Show in widget** switch. The backend
must persist `show_in_widget` (boolean, default false) through the existing
authenticated workflow PATCH API, and include it in list/detail responses.
Public `compliance_packets` summaries must contain `show_in_widget: true`;
the widget excludes every entry without that exact flag. The server must also
filter by that flag, public audience, workflow type, and the registered site's
workspace, then recheck eligibility when accepting a request. See section G
of `docs/PUBLIC_W9_WIDGET_BACKEND_GUIDE.md` for the exact contract.
