import Input from './Input';
import Button from './Button';

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155' };
const selectStyle = { width: '100%', marginTop: 6, padding: 10, border: '1px solid #d1d5db', borderRadius: 5, color: '#0f172a', background: 'white', fontSize: 13 };
const optionLabelStyle = { ...labelStyle, fontSize: 11, color: '#716acb' };
const panelStyle = { padding: 12, border: '1px solid #a5a1e7', borderRadius: 8, background: '#fafaff' };

export default function W9QuickRequest({ name, setName, email, setEmail, phone, setPhone, referenceId, setReferenceId, loading, onSubmit, sentTo, onReset, vendorTypes, vendorType, onVendorTypeChange, compliancePackets, compliancePacketId, onCompliancePacketChange, formDefinitions, formDefinitionId, onFormDefinitionChange, sentFormCode, sentMessage, requestError, choicesNotice, refreshing, onRefresh, enabled }) {
  const selectedForm = formDefinitions.find(form => form.key === formDefinitionId);
  const formCode = selectedForm?.code || 'tax form';
  const busy = loading || refreshing;
  if (sentTo) return (
    <section role="status" style={{ ...panelStyle, borderColor: '#86efac', background: '#f0fdf4' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 20, color: '#166534' }}>{sentFormCode} request sent</h2>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>{sentMessage}</p>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>Check <strong>{sentTo}</strong> for your {sentFormCode} request and instructions to complete and sign your form.</p>
      <Button onClick={onReset} style={{ width: '100%', background: '#7c78c5', color: 'white' }}>Send another request</Button>
    </section>
  );

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: '0 0 8px', fontSize: 21, color: '#0f172a' }}>Request your {formCode}</h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#475569' }}>Send yourself a tax form request. Enter your details below and complete your form using the link in your email.</p>
      </div>
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {vendorTypes.length > 0 && <div>
          <label htmlFor="quick-w9-vendor-type" style={optionLabelStyle}>VENDOR TYPE <span title="Choose the type of vendor completing this request." aria-label="Choose the type of vendor completing this request.">ⓘ</span></label>
          <select id="quick-w9-vendor-type" value={vendorType} onChange={event => onVendorTypeChange(event.target.value)} disabled={busy} style={selectStyle}>
            <option value="">Select vendor type (optional)...</option>
            {vendorTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>}
        <div>
          <label htmlFor="quick-w9-compliance-packet" style={optionLabelStyle}>COMPLIANCE PACKET <span title="Optionally include a compliance packet provided by this website." aria-label="Optionally include a compliance packet provided by this website.">ⓘ</span></label>
          <select id="quick-w9-compliance-packet" value={compliancePacketId} onChange={event => onCompliancePacketChange(event.target.value)} disabled={busy || compliancePackets.length === 0} aria-describedby={compliancePackets.length === 0 ? 'quick-w9-no-packets' : undefined} style={selectStyle}>
            <option value="">Select packet...</option>
            {compliancePackets.map(packet => <option key={packet.id} value={packet.id}>{packet.name}</option>)}
          </select>
          {compliancePackets.length === 0 && <p id="quick-w9-no-packets" style={{ margin: '6px 0 0', color: '#64748b', fontSize: 12 }}>No compliance packets are available for this website.</p>}
        </div>
      </div>
      <div style={panelStyle}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#716acb' }}>TIN REQUEST FORM TYPE</span>
        <label htmlFor="quick-w9-form-type" style={{ ...labelStyle, marginTop: 10 }}>Form type</label>
        <select id="quick-w9-form-type" required value={formDefinitionId} onChange={event => onFormDefinitionChange(event.target.value)} disabled={busy || !enabled || formDefinitions.length === 0} style={{ ...selectStyle, borderColor: '#a5a1e7' }}>
          <option value="">Select a tax form...</option>
          {formDefinitions.map(form => <option key={form.key} value={form.key}>{form.name} — {form.taxYear}</option>)}
        </select>
        {(!enabled || formDefinitions.length === 0) && <p role="status" style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>{refreshing ? 'Loading available tax forms…' : 'No tax forms are currently available for this website.'}</p>}
        <button type="button" disabled={busy} onClick={onRefresh} style={{ marginTop: 10, border: 0, background: 'transparent', color: '#625bbb', cursor: busy ? 'wait' : 'pointer', fontSize: 12 }}>Refresh available forms and packets</button>
      </div>
      <div style={{ padding: 12, borderRadius: 6, background: '#7c78c5', color: 'white', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>✓ Quick Request</div>
      <p style={{ margin: 0, padding: 10, border: '1px solid #bfdbfe', borderRadius: 5, background: '#eff6ff', color: '#334155', fontSize: 12, lineHeight: 1.6 }}>Your name and email address are required to send a tax form request.</p>
      {requestError && <p role="alert" style={{ margin: 0, color: '#b91c1c', fontSize: 13, lineHeight: 1.6 }}>{requestError}</p>}
      {choicesNotice && <p role="status" style={{ margin: 0, color: '#334155', fontSize: 13, lineHeight: 1.6 }}>{choicesNotice}</p>}
      <fieldset disabled={busy} style={{ display: 'flex', flexDirection: 'column', gap: 14, border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <label htmlFor="quick-w9-name" style={labelStyle}>Vendor name (your name) *
          <Input id="quick-w9-name" required autoComplete="name" maxLength={255} value={name} onChange={event => setName(event.target.value)} placeholder="Enter your name" style={{ marginTop: 6 }} />
        </label>
        <label htmlFor="quick-w9-email" style={labelStyle}>Email address *
          <Input id="quick-w9-email" type="email" required autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" style={{ marginTop: 6 }} />
        </label>
        <label htmlFor="quick-w9-account" style={labelStyle}>Account No. (optional)
          <Input id="quick-w9-account" maxLength={100} value={referenceId} onChange={event => setReferenceId(event.target.value)} placeholder="Enter account or reference number" style={{ marginTop: 6 }} />
        </label>
        <label htmlFor="quick-w9-phone" style={labelStyle}>Cell No. (optional)
          <Input id="quick-w9-phone" type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={event => setPhone(event.target.value)} placeholder="Enter your phone number" style={{ marginTop: 6 }} />
        </label>
      </fieldset>
      <Button type="submit" loading={loading} disabled={busy || !enabled || !selectedForm} style={{ width: '100%', background: '#7c78c5', color: 'white', opacity: busy || !enabled || !selectedForm ? 0.6 : 1 }}>Send {formCode} request to my email</Button>
    </form>
  );
}
