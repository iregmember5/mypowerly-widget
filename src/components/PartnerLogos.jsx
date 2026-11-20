const font = "'Poppins', Arial, sans-serif";

export const MidAmericaMark = ({ size = 30 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 78 64" fill="none">
    <polyline points="8,54 22,16 35,42 48,16" stroke="#1c3f94" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 56 Q42 22 54 24 Q64 26 74 54" stroke="#f5a623" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

export const WidgetBrandAvatar = ({ imageUrl, className = '' }) => (
  <span aria-hidden="true" className={'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ' + className}>
    <MidAmericaMark size={30} />
    {imageUrl && (
      <img
        src={imageUrl}
        alt=""
        onError={event => { event.currentTarget.style.display = 'none'; }}
        className="absolute inset-0 h-full w-full rounded-full bg-white object-contain p-1"
      />
    )}
  </span>
);
export const MidAmericaLogo = ({ height = 24 }) => (
  <svg role="img" aria-label="Mid America Tax Planners" width={height * 290 / 64} height={height} viewBox="0 0 290 64" style={{ maxWidth: '100%' }}>
    <polyline points="8,54 22,16 35,42 48,16" fill="none" stroke="#1c3f94" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 56 Q42 22 54 24 Q64 26 74 54" fill="none" stroke="#f5a623" strokeWidth="8" strokeLinecap="round" />
    <text x="84" y="30" fontFamily={font} fontSize="22" fontWeight="800" fill="#1c3f94" textLength="196" lengthAdjust="spacingAndGlyphs">MID AMERICA</text>
    <line x1="84" y1="42" x2="110" y2="42" stroke="#f5a623" strokeWidth="2" />
    <text x="116" y="47" fontFamily={font} fontSize="12" fontWeight="600" fill="#1c3f94" textLength="132" lengthAdjust="spacingAndGlyphs">TAX PLANNERS</text>
    <line x1="254" y1="42" x2="280" y2="42" stroke="#f5a623" strokeWidth="2" />
  </svg>
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