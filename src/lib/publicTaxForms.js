const isId = value => (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) || (typeof value === 'string' && value.trim().length > 0);
const uniqueBy = (values, key) => Array.from(new Map(values.map(value => [key(value), value])).values());

/** Public settings are the complete site-specific catalog; never invent choices. */
export function readPublicTaxChoices(settings) {
  if (settings?.w9_1099_chaser_enabled !== true) return { enabled: false, forms: [], vendors: [], packets: [] };
  const forms = (Array.isArray(settings.form_definitions) ? settings.form_definitions : [])
    .filter(form => isId(form?.id) && typeof form.form_code === 'string' && form.form_code.trim() && Number.isInteger(form.tax_year) && form.tax_year > 0)
    .map(form => ({ id: form.id, key: String(form.id), code: form.form_code, name: typeof form.form_name === 'string' && form.form_name.trim() ? form.form_name : form.form_code, taxYear: form.tax_year }));
  const vendors = (Array.isArray(settings.vendor_types) ? settings.vendor_types : [])
    .filter(type => typeof type?.slug === 'string' && type.slug && typeof type.name === 'string' && type.name)
    .map(type => ({ value: type.slug, label: type.name }));
  const packets = (Array.isArray(settings.compliance_packets) ? settings.compliance_packets : [])
    .filter(packet => isId(packet?.id) && typeof packet.name === 'string' && packet.name)
    .map(packet => ({ id: String(packet.id), name: packet.name, vendorType: packet.vendor_type || '' }));
  return { enabled: true, forms: uniqueBy(forms, form => form.key), vendors: uniqueBy(vendors, type => type.value), packets: uniqueBy(packets, packet => packet.id) };
}

export function taxSelectionPayload({ forms, vendors, packets }, definitionId, vendorType, packetId) {
  const form = forms.find(form => form.key === definitionId);
  if (!form) throw new Error('Please select an available tax form.');
  if (vendorType && !vendors.some(type => type.value === vendorType)) throw new Error('Please select an available vendor type.');
  if (packetId && !packets.some(packet => packet.id === packetId)) throw new Error('Please select an available compliance packet.');
  return {
    form_definition_id: form.id,
    tax_year: form.taxYear,
    ...(vendorType ? { vendor_type: vendorType } : {}),
    ...(packetId ? { compliance_packet_id: packetId } : {}),
  };
}

export function deliveryConfirmed(body) {
  return body?.success === true && body.email_sent !== false && body.data?.email_sent !== false &&
    (body.email_sent === true || body.data?.email_sent === true);
}

export function publicMessage(body, fallback) {
  return typeof body?.message === 'string' && body.message.trim() ? body.message : fallback;
}

export function selectionUnavailable(body) {
  if (!body || typeof body !== 'object') return false;
  const selectionFields = ['form_definition_id', 'tax_year', 'vendor_type', 'compliance_packet_id'];
  if (body.errors && typeof body.errors === 'object' && selectionFields.some(key => key in body.errors)) return true;
  const text = [body.code, body.error_code, body.message].filter(value => typeof value === 'string').join(' ').replaceAll('_', ' ');
  return /(form|definition|packet|vendor|tax year)/i.test(text) && /(unavailable|not available|no longer|invalid|not permitted|not allowed|not configured|not found|does not exist|inactive|archived|unpublished|disabled)/i.test(text);
}
