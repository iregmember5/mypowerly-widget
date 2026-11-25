import { useEffect, useRef, useState } from 'react';

const iconPaths = {
  'email-us': 'M3 5h18v14H3zM3 6l9 7 9-7',
  'contact-us': 'M5 3h4l2 5-2.5 2a13 13 0 0 0 5.5 5.5l2-2.5 5 2v4a2 2 0 0 1-2 2C10.2 21 3 13.8 3 5a2 2 0 0 1 2-2Z',
  'schedule-an-appointment': 'M3 5h18v16H3zM7 3v4m10-4v4M3 10h18m-9 3v5m-2.5-2.5h5',
  'schedule-a-tour': 'M3 5h18v16H3zM7 3v4m10-4v4M3 10h18m-14 4h3m4 0h3m-10 3h3m4 0h3',
};

function ServiceIcon({ value }) {
  const common = { 'aria-hidden': true, width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'shrink-0' };
  if (value === 'chat') {
    return (
      <svg {...common}>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.6-4.1A8.5 8.5 0 1 1 21 11.5Z" />
        <g fill="#f5a623" stroke="none"><circle cx="8" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="16" cy="12" r="1.2" /></g>
      </svg>
    );
  }
  if (value === 'pay-us') {
    return (
      <svg {...common}>
        <rect x="2" y="4" width="19" height="15" rx="2" />
        <path d="M2 9h19M5 15h5" />
        <circle cx="18" cy="18" r="5" fill="#f5a623" stroke="none" />
        <text x="18" y="20.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff" stroke="none">$</text>
      </svg>
    );
  }  if (value === 'w9-request') {
    return (
      <svg {...common}>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4" />
        <text x="12" y="14" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="currentColor" stroke="none" fontFamily="system-ui, sans-serif">W-9</text>
        <path d="M9 17.5h6" stroke="#f5a623" strokeWidth="2" />
      </svg>
    );
  }
  return <svg {...common}><path d={iconPaths[value] || iconPaths['email-us']} /></svg>;
}
export default function WidgetHome({ siteName, options, selectedService, onServiceChange, onContinue, scrollContainerRef }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const items = options.filter(option => option.value);
  const selected = items.find(option => option.value === selectedService);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = event => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const container = scrollContainerRef?.current;
      container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, scrollContainerRef]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const openList = () => {
    setActiveIndex(Math.max(0, items.findIndex(option => option.value === selectedService)));
    setOpen(true);
  };

  const choose = value => {
    onServiceChange(value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = event => {
    const last = items.length - 1;
    if (last < 0) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex(index => Math.min(last, index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex(index => Math.max(0, index - 1));
        break;
      case 'Home':
        if (open) { event.preventDefault(); setActiveIndex(0); }
        break;
      case 'End':
        if (open) { event.preventDefault(); setActiveIndex(last); }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!open) openList();
        else choose(items[activeIndex].value);
        break;
      case 'Escape':
        if (open) { event.preventDefault(); setOpen(false); }
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
    }
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-4 pt-3 text-[#0b1d51]">
      {/* Banner pill */}
      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/70 bg-gradient-to-r from-[#bcd6fb] via-[#d8e6fd] to-[#fde3b8] px-2.5 py-2 text-[clamp(10px,3.3vw,12px)] font-bold leading-tight tracking-tight text-[#0b1d51] shadow-sm">
        <svg aria-hidden="true" className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="#f5b731">
          <path d="M10 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
          <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14Z" />
        </svg>
        <span>Get Instant W-9 &amp; 1099 Tax Forms with AI</span>
      </div>

      {/* Welcome */}
      <div className="mt-4 flex min-w-0 items-center gap-3">
        <svg aria-hidden="true" className="shrink-0" width="84" height="80" viewBox="0 0 84 80" fill="none">
          <ellipse cx="42" cy="48" rx="38" ry="28" fill="#dbe9fb" />
          {/* W-9 clipboard */}
          <g transform="rotate(-8 30 40)">
            <rect x="8" y="14" width="44" height="52" rx="5" fill="#f4f8ff" stroke="#2b4f8f" strokeWidth="2" />
            <rect x="21" y="9" width="18" height="9" rx="3" fill="#2b4f8f" />
            <rect x="14" y="24" width="22" height="12" rx="3" fill="#fff" stroke="#2b4f8f" strokeWidth="1.5" />
            <text x="25" y="33" textAnchor="middle" fontSize="9" fontWeight="800" fill="#1e3a8a" fontFamily="system-ui, sans-serif">W-9</text>
            <path d="M14 43h30M14 49h30M14 55h20" stroke="#8fb0e0" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* 1099 paper */}
          <g transform="rotate(7 58 42)">
            <rect x="40" y="20" width="36" height="44" rx="4" fill="#fff7e6" stroke="#f0a030" strokeWidth="2" />
            <rect x="46" y="27" width="24" height="12" rx="3" fill="#fff" stroke="#f0a030" strokeWidth="1.5" />
            <text x="58" y="36" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#c2410c" fontFamily="system-ui, sans-serif">1099</text>
            <path d="M46 46h24M46 52h24" stroke="#f5c77a" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* AI badge */}
          <rect x="30" y="58" width="32" height="16" rx="8" fill="#0b1d51" />
          <text x="46" y="69.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">AI ✦</text>
        </svg>
        <div className="min-w-0">
          <h2 className="text-[15px] font-extrabold leading-tight text-[#0b1d51]">
            Welcome to {siteName}
          </h2>
          <p className="mt-1 text-[12.5px] leading-snug text-slate-700">
            Select a service below. We're here to help 24x7.
          </p>
        </div>
      </div>

      {/* Select */}
      <div className="my-auto">
        <span id="widget-service-label" className="mb-3 block text-[24px] font-extrabold leading-tight tracking-tight text-[#0b1d51]">
          Select a service
        </span>
        <div ref={wrapRef} className="relative">
          <button
            ref={triggerRef}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? 'widget-service-list' : undefined}
            aria-labelledby="widget-service-label"
            aria-activedescendant={open ? 'widget-service-opt-' + activeIndex : undefined}
            onClick={() => (open ? setOpen(false) : openList())}
            onKeyDown={onKeyDown}
            className={'flex h-14 w-full items-center justify-between rounded-xl border-2 bg-white px-4 text-left text-[19px] font-semibold text-[#0b1d51] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0872da] ' + (open ? 'border-[#1d4fd7]' : 'border-[#1e2b7a]')}
          >
            <span className="truncate">{selected ? selected.label : 'Choose a service...'}</span>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0b1d51" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={'shrink-0 transition-transform ' + (open ? '' : 'rotate-180')}>
              <path d="M4 13l6-6 6 6" />
            </svg>
          </button>
          {open && (
            <ul
              id="widget-service-list"
              role="listbox"
              aria-labelledby="widget-service-label"
              className="mt-1.5 space-y-1 rounded-2xl border border-[#dbe7fa] bg-white p-2 shadow-[0_12px_30px_rgba(11,29,81,0.18)] [scrollbar-width:thin]"
            >
              {items.map((option, index) => {
                const active = index === activeIndex;
                const isSelected = option.value === selectedService;
                return (
                  <li
                    key={option.value}
                    id={'widget-service-opt-' + index}
                    ref={element => { optionRefs.current[index] = element; }}
                    role="option"
                    aria-selected={isSelected}
                    onPointerEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option.value)}
                    className={'flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-bold leading-tight transition-colors ' + (active ? 'bg-gradient-to-r from-[#0a3fa8] to-[#052a78] text-white shadow-md' : 'bg-[#e4eefc] text-[#0b1d51] ' + (isSelected ? 'ring-2 ring-inset ring-[#1d4fd7]' : ''))}
                  >
                    <ServiceIcon value={option.value} />
                    <span className="min-w-0 flex-1">{option.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {!open && (
        <button
          type="button"
          onClick={onContinue}
          style={{ background: 'linear-gradient(100deg, #06123f 0%, #06408e 42%, #008cff 100%)' }}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-[18px] font-bold text-white shadow-md transition hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0875e8]"
        >
          Continue
          <svg aria-hidden="true" width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="#f5a623" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 8h20M16 2l6 6-6 6" />
          </svg>
        </button>
        )}
      </div>
    </div>
  );
}
