const font = "'Poppins', Arial, sans-serif";

const midAmericaLogoUrl = '/mid-america-logo.svg';
const midAmericaMarkUrl = '/mid-america-mark.svg';

export const WidgetBrandAvatar = ({ className = '' }) => (
  <span aria-hidden="true" className={'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ' + className}>
    <img src={midAmericaMarkUrl} alt="" className="h-full w-full object-contain" />
  </span>
);

export const MidAmericaLogo = ({ height = 24 }) => (
  <img
    src={midAmericaLogoUrl}
    alt="Mid America Tax Planners"
    height={height}
    style={{ height, width: 'auto', maxWidth: '100%' }}
  />
);
export const MyInsuranceBrokerLogo = ({ height = 24 }) => (
  <svg role="img" aria-label="My Insurance Broker" width={height * 170 / 64} height={height} viewBox="0 0 170 64" style={{ maxWidth: '100%' }}>
    <path d="M25 5 L45 12 V31 C45 45 36 53 25 59 C14 53 5 45 5 31 V12 Z" fill="#eef3fc" stroke="#1c3f94" strokeWidth="5" strokeLinejoin="round" />
    <polyline points="14,31 22,40 37,21" fill="none" stroke="#f5a623" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <text x="58" y="16" fontFamily={font} fontSize="16" fontWeight="700" fill="#111">My</text>
    <text x="58" y="35" fontFamily={font} fontSize="20" fontWeight="700" fill="#111">Insurance</text>
    <text x="58" y="54" fontFamily={font} fontSize="20" fontWeight="700" fill="#111">Broker<tspan fontSize="9" dy="-8">®</tspan></text>
  </svg>
);

export const MyBondBrokerLogo = ({ height = 24 }) => (
  <svg role="img" aria-label="My Bond Broker" width={height * 150 / 64} height={height} viewBox="0 0 150 64" style={{ maxWidth: '100%' }}>
    <path d="M2 22 L36 4 L70 22 Z" fill="#1c3f94" />
    <rect x="8" y="25" width="56" height="5" fill="#1c3f94" />
    <rect x="12" y="33" width="9" height="18" fill="#f5a623" />
    <rect x="25" y="33" width="9" height="18" fill="#f5a623" />
    <rect x="38" y="33" width="9" height="18" fill="#f5a623" />
    <rect x="51" y="33" width="9" height="18" fill="#f5a623" />
    <rect x="8" y="53" width="56" height="4" fill="#1c3f94" />
    <rect x="3" y="58" width="66" height="4" fill="#1c3f94" />
    <text x="80" y="16" fontFamily={font} fontSize="16" fontWeight="700" fill="#111">My</text>
    <text x="80" y="35" fontFamily={font} fontSize="20" fontWeight="700" fill="#111">Bond</text>
    <text x="80" y="54" fontFamily={font} fontSize="20" fontWeight="700" fill="#111">Broker<tspan fontSize="9" dy="-8">®</tspan></text>
  </svg>
);