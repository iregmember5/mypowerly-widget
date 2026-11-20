import { readEffectivePoweredBy } from '../lib/poweredBy';
import { MidAmericaLogo, MyInsuranceBrokerLogo, MyBondBrokerLogo } from './PartnerLogos';

const partnerLogoComponents = {
  midAmerica: MidAmericaLogo,
  insurance: MyInsuranceBrokerLogo,
  bond: MyBondBrokerLogo,
};
function SocialIcon({ label }) {
  if (label === 'Facebook') return (
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21z" />
    </svg>
  );
  if (label === 'YouTube') return (
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#FF0000" />
      <rect x="5.5" y="7.8" width="13" height="8.4" rx="2.6" fill="#fff" />
      <path fill="#FF0000" d="M10.6 10.2l3.6 1.8-3.6 1.8z" />
    </svg>
  );
  if (label === 'LinkedIn') return (
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#0A66C2" />
      <circle cx="8" cy="7.9" r="1.3" fill="#fff" />
      <rect x="6.8" y="10.4" width="2.4" height="6.8" fill="#fff" />
      <path fill="#fff" d="M11.2 10.4h2.3v1c.4-.6 1.1-1.2 2.3-1.2 2.4 0 2.8 1.6 2.8 3.6v3.4h-2.4v-3c0-.8 0-1.8-1.1-1.8s-1.5.9-1.5 1.8v3h-2.4z" />
    </svg>
  );
  return null;
}

export function readFooterContent(settings) {
  return {
    logos: [
      { kind: 'midAmerica', altText: 'Mid America Tax Planners' },
      { kind: 'insurance', altText: 'My Insurance Broker' },
      { kind: 'bond', altText: 'My Bond Broker' },
    ],
    links: ['Facebook', 'YouTube', 'LinkedIn'].map((label) => ({ label })),
    poweredBy: readEffectivePoweredBy(settings),
  };
}
export default function WidgetFooter({ content }) {
  const { logos, links, poweredBy } = content;
  return (
    <footer className="mt-auto w-full shrink-0 bg-white text-[#234d71]">
      {logos.length > 0 && (
        <div className="flex items-center border-b border-slate-200 px-2 py-2.5">
          {logos.map((logo, index) => {
            const LogoComponent = partnerLogoComponents[logo.kind];
            const image = LogoComponent
              ? <LogoComponent height={24} />
              : <img src={logo.imageUrl} alt={logo.altText} className="mx-auto h-8 max-w-full object-contain sm:h-9" />;
            return (
              <div key={index} className="flex min-w-0 flex-1 items-center justify-center px-1.5 first:pl-0 last:pr-0 [&:not(:last-child)]:border-r [&:not(:last-child)]:border-[#6686a8]">
                {logo.linkUrl ? (
                  <a href={logo.linkUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2b5a7d]">
                    {image}
                  </a>
                ) : image}
              </div>
            );
          })}
        </div>
      )}
      <div className="flex min-h-10 items-center justify-between gap-2 px-3 py-2 text-[11px]">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
          {links.map((link) => (
            <span key={link.label} role="img" title={link.label} aria-label={link.label + ' sample logo'} className="inline-flex h-7 w-7 items-center justify-center">
              <SocialIcon label={link.label} />
            </span>
          ))}
        </div>
        <span className="shrink-0 text-[#2b5a7d] underline underline-offset-2">Terms &amp; Conditions</span>
      </div>
      {poweredBy.url ? (
        <a href={poweredBy.url} target="_blank" rel="noopener noreferrer" className="flex min-h-6 items-center justify-center border-t border-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2b5a7d]">
          Powered by {poweredBy.name}
        </a>
      ) : (
        <div className="flex min-h-6 items-center justify-center border-t border-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">
          Powered by {poweredBy.name}
        </div>
      )}
    </footer>
  );
}