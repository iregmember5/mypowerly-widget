import Input from './Input';
import Button from './Button';

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155' };
const panelStyle = { padding: 12, border: '1px solid #a5a1e7', borderRadius: 8, background: '#fafaff' };

export default function W9QuickRequest({ name, setName, email, setEmail, phone, setPhone, referenceId, setReferenceId, loading, onSubmit, sentTo, onReset }) {
  if (sentTo) return (
    <section role="status" style={{ ...panelStyle, borderColor: '#86efac', background: '#f0fdf4' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 20, color: '#166534' }}>W-9 request submitted</h2>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>Check <strong>{sentTo}</strong> for your W-9 request and instructions to complete and sign your form.</p>
      <Button onClick={onReset} style={{ width: '100%', background: '#7c78c5', color: 'white' }}>Send another request</Button>
    </section>
  );

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: '0 0 8px', fontSize: 21, color: '#0f172a' }}>Request your W-9</h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#475569' }}>Send yourself a W-9 request. Enter your details below and complete your form using the link in your email.</p>
      </div>
      <div style={panelStyle}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#716acb' }}>TIN REQUEST FORM TYPE</span>
        <label htmlFor="quick-w9-form-type" style={{ ...labelStyle, marginTop: 10 }}>Form type</label>
        <select id="quick-w9-form-type" disabled value="W9" style={{ width: '100%', marginTop: 6, padding: 10, border: '1px solid #a5a1e7', borderRadius: 5, color: '#0f172a', background: 'white' }}>
          <option value="W9">W-9 — Form W-9</option>
        </select>
      </div>
      <div style={{ padding: 12, borderRadius: 6, background: '#7c78c5', color: 'white', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>✓ Quick Request</div>
      <p style={{ margin: 0, padding: 10, border: '1px solid #bfdbfe', borderRadius: 5, background: '#eff6ff', color: '#334155', fontSize: 12, lineHeight: 1.6 }}>Your name and email address are required to send a W-9 request.</p>
      <fieldset disabled={loading} style={{ display: 'flex', flexDirection: 'column', gap: 14, border: 0, padding: 0, margin: 0, minWidth: 0 }}>
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
      <Button type="submit" loading={loading} style={{ width: '100%', background: '#7c78c5', color: 'white' }}>Send W-9 request to my email</Button>
    </form>
  );
}
