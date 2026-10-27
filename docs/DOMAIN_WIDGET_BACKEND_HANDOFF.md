# Backend handoff: per-domain widget tax forms and compliance packets

## Current product decision — replaces the workflow switch design

Publication is now configured at **`/widget/mypowerly` → domain → Settings**.
An owner enables W9 & 1099 Chaser, chooses one or more tax form definitions and
compliance packets, and saves the domain settings. The parrot lists only those
saved choices. Different domains can offer different choices from the same
workspace.

The previous per-workflow **Show in widget** switch has been removed from the
frontend. Do not require `workflow.show_in_widget` for this new flow or use a
workflow's global flag as the source of public choices. The domain's saved
allowlists are authoritative. Existing recipient signing/access rules remain.

**Vendor types are not an owner-selected allowlist:** return all system vendor
types and all custom vendor types available to the registered site's workspace.
Do not narrow vendors by selected packet, selected form, or packet vendor type.
Do not return another workspace's private custom types. The parrot lists every
valid entry returned, and keeps its vendor selector visible even when empty.

This document specifies the frontend contract. Backend model names/migrations
must be implemented in the backend repository; those sources were not supplied.

## 1. Existing authenticated catalogs used by the settings editor

| Dropdown | Existing API/source |
| --- | --- |
| Tax forms | `listTinRequestFormDefinitions()` in `src/services/api/WP-1099/MetaDataService.ts` |
| Package discovery | `GET /api/tax-filling/meta-data/packages/` |
| Published definitions | `GET /api/tax-filling/meta-data/definitions/?package_code=SELECTED_PACKAGE&status=published` |
| Compliance packets | `GET /api/tax-filling/compliance-workflows/?workflow_type=compliance-packet&workspace_id=WORKSPACE_UUID&page=1&page_size=200` |

The existing metadata helper prefers an active `IRSW` package, then an active
`IRS-W` package. They are distinct identifiers, not interchangeable spellings.
The settings editor loads published definitions across the available tax years,
uses definition IDs, and displays their names, years, and versions. It follows
pagination where the catalog returns more records.

Compliance choices use real workspace-owned, non-template `compliance-packet`
workflows. They are not synthetic stock-template IDs. The editor follows
workflow pagination and uses workflow IDs as strings. No workflow step configs
are required to configure this dropdown.

Keep these catalogs authenticated. The public parrot uses only the public
validation and submission routes described below.

## 2. Persist two new allowlists on each widget-settings record

Add these writable fields to the existing widget-settings API:

| Field | Type | Meaning |
| --- | --- | --- |
| `enabled_form_definition_ids` | Array of integer definition IDs | Tax definitions offered by this domain. |
| `enabled_compliance_packet_ids` | Array of workflow ID strings | Compliance packets offered by this domain. |

Defaults: `[]` for both. An empty array means **offer none**, not offer all.
Store these on the widget settings for the registered frontend site. Do not
store them globally on a user, workspace, or workflow. Deduplicate IDs.

Preserve `enabled_forms`: that existing field contains service-webform IDs,
not tax-definition IDs. The three ID arrays refer to different resources.

### Create

```http
POST /blogs/api/v2/widget-settings/
```

### Edit

```http
PATCH /blogs/api/v2/widget-settings/SETTINGS_RECORD_ID/
```

Example tax-related portion of the request (the frontend also retains services,
footer/branding, and existing settings fields):

```json
{
  "frontend_site_id": 42,
  "w9_1099_chaser_enabled": true,
  "enabled_forms": [55],
  "enabled_form_definition_ids": [101, 402],
  "enabled_compliance_packet_ids": ["packet-uuid-one", "packet-uuid-two"]
}
```

IDs are examples. `frontend_site_id` identifies the registered frontend;
`SETTINGS_RECORD_ID` identifies its widget-settings row; neither is the
workspace UUID used in public validation.

Validate ownership of the frontend site and the selected workflows. Selected
form definitions must be published, accessible under the site's configuration,
and belong to an active permitted package. Reject invalid IDs with a useful
`message` and field errors; do not silently drop them or select replacements.

Selecting a packet explicitly opts its summary into this domain's widget.
Preserve the workflow's audience/login/access fields. If existing product rules
forbid a particular workflow from being offered, reject that selection clearly;
do not silently ignore it. Do not require the retired `show_in_widget` flag.

A PATCH that omits either new array must preserve its current value. Supplying
`[]` clears that selection. Disabling the tax feature can preserve stored
selections for later re-enabling, while suppressing them publicly.

## 3. Return the saved allowlists in admin read/write responses

Include both arrays in create/update output and in:

```http
GET /blogs/api/v2/widget-settings/?frontend_site_id=42
```

Representative existing list response:

```json
{
  "results": [
    {
      "id": 9,
      "frontend_site": 42,
      "w9_1099_chaser_enabled": true,
      "enabled_forms": [55],
      "enabled_form_definition_ids": [101, 402],
      "enabled_compliance_packet_ids": ["packet-uuid-one", "packet-uuid-two"]
    }
  ]
}
```

Keep other existing response fields. The admin client accepts its existing
list/envelope formats and snake_case/camelCase conversion. Values must still
be real arrays. Include empty arrays explicitly.

The frontend checks the saved response. If the new arrays are absent, it reads
the domain settings back. It does not close the settings modal with a success
message unless the relevant saved selections can be confirmed. Implement input
and output serializers together so an ignored field cannot appear saved.

## 4. Public validation: return selected forms/packets and all vendor types

```http
POST /blogs/api/v2/widget-settings/validate-frontend-url/
```

```json
{
  "frontend_url": "https://example.com",
  "workspace_id": "REGISTERED-WORKSPACE-UUID"
}
```

Resolve the registered origin and workspace together. Return existing widget
settings plus the following public projections:

```json
{
  "success": true,
  "registered": true,
  "site_name": "example.com",
  "widget_settings": {
    "w9_1099_chaser_enabled": true,
    "form_definitions": [
      { "id": 101, "form_code": "W-9", "form_name": "Form W-9", "package_code": "IRSW", "tax_year": 2026, "version": 1 },
      { "id": 402, "form_code": "W-8BEN", "form_name": "Form W-8BEN", "package_code": "IRSW", "tax_year": 2026, "version": 1 }
    ],
    "compliance_packets": [
      { "id": "packet-uuid-one", "name": "Vendor onboarding", "vendor_type": "vendor" },
      { "id": "packet-uuid-two", "name": "Contractor onboarding", "vendor_type": "contractor" }
    ],
    "vendor_types": [
      { "slug": "vendor", "name": "Vendor" },
      { "slug": "contractor", "name": "Contractor" },
      { "slug": "affiliate", "name": "Affiliate" }
    ]
  }
}
```

`form_definitions` = saved definition IDs intersected with currently eligible
published/active definitions. `compliance_packets` = saved workflow IDs
intersected with existing eligible workspace workflows. Do not include other
forms or workflows merely because they are public or belong to the owner.

`vendor_types` = the complete allowed vendor-type catalog for the workspace,
including system types and workspace-accessible custom types. Return the whole
array, not only its first page, and not only types used by selected workflows.
This is a separate rule from the form/packet allowlists.

Public packet summaries need only ID, name, and vendor type. Do not expose
private steps, documents, credentials, or recipient information.

When the tax feature is disabled, return empty tax lists. When a saved list is
empty, return its corresponding empty public list. Remove deleted/ineligible
records from public projections without substituting other records. Invalidate
cached public settings after any domain-settings update.

## 5. Public submission revalidates the saved domain choices

```http
POST /api/widgets/submit-form/
```

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
  "vendor_type": "affiliate",
  "compliance_packet_id": "packet-uuid-one"
}
```

Require the submitted definition to remain in this domain's saved allowlist and
published/active; validate its year. If a packet is supplied, require it to
remain in this domain's saved packet allowlist and belong to the resolved
workspace. A valid ID from another domain's configuration must not bypass the
current site's selection.

Validate vendor slug against the full workspace vendor catalog, independently
of packet vendor type. Packet vendor type is a suggestion, not a strict
compatibility rule. Packet and vendor are optional; phone can be empty for tax
requests. Preserve normal service forms and their required fields.

Reuse existing filing-request and workflow attachment services. Resolve packet
steps internally. New frontend requests send definition ID/year, not the legacy
`request_w9` flag. Existing legacy embeds can keep the backend's exactly-one-
public-W-9 compatibility rule, using this domain's selected definitions.

Send success only according to actual delivery state. The widget shows a sent
receipt only after successful HTTP/`success: true` and explicit `email_sent:
true` at top level or under `data`, with no conflicting false value. On stale
selection errors, return a useful public message/field error; the widget reloads
settings, preserves visitor details, and asks for explicit reselection.

## 6. Migration and acceptance

- Add domain settings relations/arrays with empty defaults and ownership checks.
- Implement read/write serializers for both new arrays.
- Stop requiring global workflow `show_in_widget` for this feature. Existing
  global flags should not automatically publish workflows on every domain.
- Configure each domain's allowlists explicitly; no implicit offer-all migration.
- Verify save -> reopen -> same selections, add/remove/clear, and disabled/re-enable.
- Verify domain A and domain B have independent choices within one workspace.
- Verify only selected forms/packets are returned publicly, but all valid
  workspace vendor types are returned regardless of those selections.
- Verify stale, removed, cross-domain, cross-workspace, and disabled selections
  fail before creating a filing request or sending email.
- Preserve authentication for all admin catalogs and settings routes. Public
  routes remain scoped by registered site/workspace and existing abuse controls.

Frontend changes were prepared without running builds or broad checks, as
requested. Backend persistence/public projections still require implementation.
