# MyPowerly Widget

A customer service widget that provides service requests, AI chatbot, and live chat functionality.

## Run and test locally

1. Clone the widget repository and install dependencies:

   ~~~bash
   git clone https://github.com/iregmember5/mypowerly-widget.git
   cd mypowerly-widget
   npm install
   ~~~

2. In your MyPowerly account, select the workspace you want to test and register
   test.com as a MyPowerly Widget domain in that workspace. Copy the widget ID
   from that workspace's **Get Embed Code** action. Use that ID for
   YOUR_WIDGET_ID below. The domain and widget ID must belong to the same
   workspace.

3. Start the local development server:

   ~~~bash
   npm run dev
   ~~~

   It runs at http://localhost:5174 by default. If port 5174 is occupied,
   use the local URL printed by Vite.

4. Open this URL in your browser, replacing YOUR_WIDGET_ID with the copied ID:

   ~~~text
   http://localhost:5174/?id=YOUR_WIDGET_ID&dev=true&devDomain=https%3A%2F%2Ftest.com
   ~~~

The dev=true parameter makes the local widget validate against the domain in
devDomain. The encoded value above is https://test.com. You can open this URL
directly; you do not need a separate test HTML page.

If the widget says the site is not registered, check that test.com is
registered in the same workspace as the ID in the URL and that the registered
domain matches https://test.com. To test another registered domain, URL-encode
its full origin and replace the devDomain value.

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
returns the forms and packets selected in this domain’s widget settings.

Stale selections refresh settings and require explicit reselection while
preserving visitor details. A sent confirmation requires `email_sent: true`.
Existing service forms continue using `form_ids` and their required fields.

See [the current frontend contract](docs/PUBLIC_WIDGET_FRONTEND_CONTRACT.md)
for payloads, response handling, and test coverage. Run `npm test` for the
public tax selection/response contract tests.

Owners choose the offered forms and compliance packets at
`/widget/mypowerly` → domain Settings. The workflow-card publication switch is
retired. Vendor types are the full public workspace catalog.
See [the per-domain backend handoff](docs/DOMAIN_WIDGET_BACKEND_HANDOFF.md).
