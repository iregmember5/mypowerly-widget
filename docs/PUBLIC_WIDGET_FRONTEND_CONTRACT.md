# Public widget frontend contract

Implemented from the backend developer's public widget requirements. Public
catalog access and submission use only these existing endpoints:

- `POST /blogs/api/v2/widget-settings/validate-frontend-url/`
- `POST /api/widgets/submit-form/`

The widget does not call authenticated vendor, workflow, metadata, schema, step,
or filing-request APIs. It submits to the backend that validated the site.

## Site settings

Both initial validation and choice refresh send:

```json
{
  "frontend_url": "https://example.com",
  "workspace_id": "REGISTERED-WORKSPACE-UUID"
}
```

The widget preserves existing service, branding, footer, and chat settings.
Tax choices are read exclusively from `widget_settings`:

```json
{
  "w9_1099_chaser_enabled": true,
  "form_definitions": [
    { "id": 101, "form_code": "W-9", "form_name": "Form W-9", "package_code": "IRSW", "tax_year": 2026, "version": 1 },
    { "id": 402, "form_code": "W-8BEN", "form_name": "Form W-8BEN", "package_code": "IRSW", "tax_year": 2027, "version": 1 }
  ],
  "vendor_types": [{ "slug": "vendor", "name": "Vendor" }],
  "compliance_packets": [{ "id": "packet-id", "name": "Vendor onboarding", "vendor_type": "vendor" }]
}
```

Values above are examples, never defaults in code. Select labels show the
returned form name and year. Initial entry selects the first returned valid
definition. Changing it changes both submitted definition ID and year.
Malformed definitions without an ID, code, or numeric year are excluded.

An empty definition list disables tax submission. Disabling the tax feature
hides its menu entry and ignores tax choice lists. The vendor selector remains visible when the list is empty, with an unavailable
message. It omits `vendor_type` when none is selected; no Vendor option is invented.
An empty packet list disables the optional packet selector.

The backend's packet list is authoritative. It does **not** need to include
`show_in_widget` in the public projection. The domain’s saved widget-settings allowlists control form and packet
discovery. The old workflow-dashboard publication switch has been removed;
the public frontend does not require a global workflow flag.

Vendor changes may suggest a matching packet before the visitor chooses one.
After a visitor manually chooses another packet or no packet, subsequent vendor
changes preserve that choice. Vendor type is a hint, not a compatibility rule.

## Dynamic tax submission

```json
{
  "frontend_url": "https://example.com",
  "workspace_id": "REGISTERED-WORKSPACE-UUID",
  "form_ids": [],
  "name": "Example Visitor",
  "email": "visitor@example.com",
  "phone": "",
  "reference_id": "Account 123",
  "note": "",
  "form_definition_id": 101,
  "tax_year": 2026,
  "vendor_type": "vendor",
  "compliance_packet_id": "packet-id"
}
```

Tax requests require name, email, and a currently returned form definition.
Phone, vendor type, and packet are optional. Packet IDs are strings; definition
IDs retain the type returned by the API. No packet steps/configs are sent.
A single tax definition is submitted per request. Duplicate clicks are guarded.

New code does not send `request_w9`, including for W-9. That legacy flag is for
older embeds; the backend may support it only when exactly one public W-9
exists. There is no automatic fallback from a missing definition list.

Existing service-only requests still submit their selected `form_ids` and
require phone under the current service form rules. They do not send tax
selection fields. The backend supports combined submissions, but the current
widget presents service and tax requests as separate flows.

## Delivery confirmation

A sent confirmation requires a successful HTTP response, `success: true`, and
an explicit `email_sent: true` at the top level or under `data`. An explicit
false at either location prevents sent confirmation. Server messages and the
selected form code appear in the confirmed receipt.

An accepted/queued response without delivery confirmation is not presented as
sent. The widget preserves visitor details and explains that delivery is not
confirmed, asking visitors to check their inbox before sending again.

Non-success responses use the public `message` or a safe generic fallback.
Internal `details`, `error` exception fields, and HTML error bodies are not
rendered as visitor messages.

## Stale choices and retry

Form, year, vendor, or packet selection errors (recognized fields or unavailable
selection messages/codes) reload the site settings from the same validated
backend. The widget:

1. Preserves visitor name/email/phone/reference values.
2. Clears old form, vendor, and packet selections.
3. Loads the fresh public choices and feature switch.
4. Leaves the form unselected and asks the visitor to select again.
5. Does not automatically resend or substitute another form/packet.

If refresh fails, submission stays disabled and a refresh control allows retry.
The control also permits manually reloading available forms and packets.

## Validation performed

- `npm test`: normalization, exact selection payloads, optional fields, disabled
  and empty catalogs, stale/forged selections, delivery confirmation, error text.
- Production Vite build and ESLint on changed source/tests.
- Browser checks with mocked public endpoints: dynamic labels and years,
  preservation of manual packet choices, duplicate submits, delivery outcomes,
  stale form/packet refresh, refresh failure/retry, explicit reselection, empty
  lists, disabled feature, existing service forms, and mobile layout.

No real email was sent during browser testing. The live domain validation check
for midamericataxplanners.com returned empty `form_definitions`, `vendor_types`,
and `compliance_packets`; production site configuration must supply choices
before tax requests are available there.

## Domain configuration (current design)

Owners configure multiple tax forms and compliance packets per domain at
`/widget/mypowerly`. Admin settings persist `enabled_form_definition_ids` and
`enabled_compliance_packet_ids`, separately from existing service `enabled_forms`.
Public validation returns only the saved permitted forms/packets and the full
workspace vendor catalog, unfiltered by those selections. See
[the backend handoff](DOMAIN_WIDGET_BACKEND_HANDOFF.md).
