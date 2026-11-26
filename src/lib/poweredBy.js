const officialBranding = () => ({ name: 'MyPowerly', url: 'https://mypowerly.com' });

/** Only the backend's effective branding object authorizes public white labeling. */
export function readEffectivePoweredBy(settings) {
  const effective = settings?.effective_powered_by;
  if (!effective || effective.white_label_enabled !== true) return officialBranding();
  const name = typeof effective.name === 'string' ? effective.name.trim() : '';
  if (!name || name.toLowerCase() === 'mypowerly') return officialBranding();

  let url = null;
  if (typeof effective.url === 'string' && effective.url.trim()) {
    try {
      const candidate = new URL(effective.url.trim());
      if (['http:', 'https:'].includes(candidate.protocol) && !candidate.username && !candidate.password && effective.url.trim().length <= 2048) {
        url = candidate.href;
      }
    } catch {
      // Invalid legacy destinations leave custom attribution as plain text.
    }
  }
  return { name, url };
}
