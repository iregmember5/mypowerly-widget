import test from 'node:test';
import assert from 'node:assert/strict';
import { readPublicTaxChoices, taxSelectionPayload, deliveryConfirmed, publicMessage, selectionUnavailable } from '../src/lib/publicTaxForms.js';

const settings = {
  w9_1099_chaser_enabled: true,
  form_definitions: [
    { id: 101, form_code: 'W-9', form_name: 'Form W-9', tax_year: 2026 },
    { id: 402, form_code: 'W-8BEN', form_name: 'Form W-8BEN', tax_year: 2027 },
  ],
  vendor_types: [{ slug: 'subcontractor', name: 'Subcontractor' }],
  compliance_packets: [{ id: 14, name: 'Onboarding', vendor_type: 'subcontractor' }],
};

test('uses returned definitions, years, vendor slugs, and packets without an extra publication flag', () => {
  const choices = readPublicTaxChoices(settings);
  assert.equal(choices.forms[1].taxYear, 2027);
  assert.equal(choices.vendors[0].value, 'subcontractor');
  assert.deepEqual(choices.packets, [{ id: '14', name: 'Onboarding', vendorType: 'subcontractor' }]);
  assert.deepEqual(taxSelectionPayload(choices, '402', 'subcontractor', '14'), {
    form_definition_id: 402, tax_year: 2027, vendor_type: 'subcontractor', compliance_packet_id: '14',
  });
});

test('never invents a W-9 definition or a vendor default for empty metadata', () => {
  const choices = readPublicTaxChoices({ w9_1099_chaser_enabled: true });
  assert.deepEqual(choices, { enabled: true, forms: [], vendors: [], packets: [] });
  assert.throws(() => taxSelectionPayload(choices, '', '', ''), /select an available tax form/);
});

test('disabled tax requests hide forms and packets while preserving the vendor catalog', () => {
  assert.deepEqual(readPublicTaxChoices({ ...settings, w9_1099_chaser_enabled: false }), { enabled: false, forms: [], vendors: [{ value: 'subcontractor', label: 'Subcontractor' }], packets: [] });
});

test('vendor and packet are optional and no legacy flag or private configuration is sent', () => {
  const payload = taxSelectionPayload(readPublicTaxChoices(settings), '101', '', '');
  assert.deepEqual(payload, { form_definition_id: 101, tax_year: 2026 });
});

test('stale or forged selections are rejected before submission', () => {
  const choices = readPublicTaxChoices(settings);
  assert.throws(() => taxSelectionPayload(choices, '999', '', ''), /tax form/);
  assert.throws(() => taxSelectionPayload(choices, '101', 'vendor', ''), /vendor type/);
  assert.throws(() => taxSelectionPayload(choices, '101', '', 'private-packet'), /compliance packet/);
});

test('malformed metadata cannot enable an invalid form submission', () => {
  const choices = readPublicTaxChoices({ ...settings, form_definitions: [null, { id: 1, form_code: 'W-9' }, { id: 2, form_code: 'W-9', tax_year: '2026' }] });
  assert.equal(choices.forms.length, 0);
});

test('sent confirmation requires an explicit successful delivery boolean', () => {
  assert.equal(deliveryConfirmed({ success: true, email_sent: true }), true);
  assert.equal(deliveryConfirmed({ success: true, data: { email_sent: true } }), true);
  for (const body of [null, { success: true }, { success: true, email_sent: 'true' }, { success: false, email_sent: true }, { success: true, email_sent: true, data: { email_sent: false } }]) {
    assert.equal(deliveryConfirmed(body), false);
  }
});

test('selection errors trigger reload while email validation errors do not', () => {
  assert.equal(selectionUnavailable({ message: 'The selected form is no longer available.' }), true);
  assert.equal(selectionUnavailable({ message: 'Selected packet is not permitted.' }), true);
  assert.equal(selectionUnavailable({ code: 'form_definition_unavailable' }), true);
  assert.equal(selectionUnavailable({ errors: { compliance_packet_id: ['Invalid choice.'] } }), true);
  assert.equal(selectionUnavailable({ message: 'Invalid email address.', errors: { email: ['Invalid email.'] } }), false);
});

test('public messages never fall back to internal exception fields', () => {
  assert.equal(publicMessage({ message: 'Please select again.', details: 'private traceback' }, 'Try again.'), 'Please select again.');
  assert.equal(publicMessage({ details: 'private traceback', error: 'private database error' }, 'Try again.'), 'Try again.');
});
