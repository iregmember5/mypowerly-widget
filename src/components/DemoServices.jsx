import { useEffect, useRef, useState } from 'react';
import { WidgetBrandAvatar } from './PartnerLogos';

const fieldClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2b5a7d] focus:outline-none focus:ring-1 focus:ring-[#2b5a7d]';
const emailFieldClass = 'w-full min-h-10 rounded-lg border border-[#334155] bg-white px-3 py-2 text-[15px] text-[#111a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0b3c81]';
const buttonClass = 'rounded-lg bg-[#2b5a7d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1e4a63] disabled:opacity-50';

const services = {
  'email-us': { title: 'Email Us', description: 'Write a sample message to the team.' },
  'contact-us': { title: 'Contact Us' },
  'schedule-an-appointment': { title: 'Schedule and Appointment', action: 'Preview appointment', confirmation: 'Appointment preview complete. No appointment was booked.', eventName: 'Appointment' },
  'schedule-a-tour': { title: 'Schedule a Tour', eventName: 'Tour', action: 'Preview booking', confirmation: 'Tour preview complete. No booking was made.' },
};

const prompts = [
  { label: 'What services do you offer?', buttonLabel: 'What services?', reply: 'This is a chat preview. A connected assistant could answer questions about available services here.' },
  { label: 'How do I request W-9 & 1099 forms?', buttonLabel: 'Request W-9 & 1099?', reply: 'Choose W9 from the widget services to preview the tax form request flow.' },
  { label: 'I have a different question', buttonLabel: 'Other question', reply: 'Type your question below to preview the conversation. Answers are examples until chat is connected.' },
];

const emailMessageLimit = 512;

function DemoEmailForm() {
  const [firstNameError, setFirstNameError] = useState(false);
  const [showTextDetails, setShowTextDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [previewComplete, setPreviewComplete] = useState(false);

  return (
    <form className="space-y-4 rounded-[14px] border border-[#4f8aaa] bg-[#e8f2fb] p-3" onSubmit={(event) => {
      event.preventDefault();
      setPreviewComplete(true);
    }} onChange={() => setPreviewComplete(false)}>
      <p className="text-[13px] font-medium text-[#334155]">* Required fields</p>
      <div className="grid grid-cols-2 items-start gap-2">
        <label className="min-w-0 space-y-1 text-[14px] font-bold text-[#0b1d51]">
          <span>First name *</span>
          <input
            type="text"
            autoComplete="given-name"
            required
            className={emailFieldClass}
            aria-invalid={firstNameError || undefined}
            aria-describedby={firstNameError ? 'demo-first-name-error' : undefined}
            onInvalid={() => setFirstNameError(true)}
            onBlur={event => setFirstNameError(!event.currentTarget.value.trim())}
            onChange={event => { if (event.currentTarget.value.trim()) setFirstNameError(false); }}
          />
          {firstNameError && <span id="demo-first-name-error" className="block text-xs text-red-700">Enter your first name.</span>}
        </label>
        <label className="min-w-0 space-y-1 text-[14px] font-bold text-[#0b1d51]">
          <span>Last name *</span>
          <input type="text" autoComplete="family-name" required className={emailFieldClass} />
        </label>
      </div>
      <label className="block space-y-1 text-[14px] font-bold text-[#0b1d51]">
        <span>Email address *</span>
        <input type="email" autoComplete="email" required className={emailFieldClass} />
      </label>
      <label className="block space-y-1 text-[14px] font-bold text-[#0b1d51]">
        <span>Phone number *</span>
        <input type="tel" autoComplete="tel" required className={emailFieldClass} />
      </label>
      <div className="space-y-1">
        <label className="flex items-start gap-2 text-[13px] leading-5 text-[#334155]">
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#2b5a7d]" />
          <span>Yes, I’d be happy to receive text messages.</span>
        </label>
        <div className="text-right">
          <button
            type="button"
            aria-expanded={showTextDetails}
            aria-controls="demo-email-text-details"
            onClick={() => setShowTextDetails(previous => !previous)}
            className="min-h-7 text-sm font-medium text-[#2b5a7d] underline underline-offset-2"
          >
            {showTextDetails ? 'Show less' : 'Show more'}
          </button>
        </div>
        <p id="demo-email-text-details" hidden={!showTextDetails} className="rounded-md bg-gray-50 p-2 text-xs leading-5 text-gray-600">
          This optional checkbox previews consent to receive text messages. Choosing it here does not sign you up for texts.
        </p>
      </div>
      <label className="block space-y-1 text-[14px] font-bold text-[#0b1d51]">
        <span>Message *</span>
        <textarea
          required
          rows={4}
          maxLength={emailMessageLimit}
          value={message}
          onChange={event => setMessage(event.target.value)}
          aria-describedby="demo-email-character-count"
          className={emailFieldClass + ' resize-y'}
        />
        <span id="demo-email-character-count" className="block text-xs font-normal text-gray-600">
          {emailMessageLimit - message.length} characters left
        </span>
      </label>
      <p className="text-xs text-gray-600">Use sample details. This demo does not send email or texts.</p>
      <button type="submit" className="w-full rounded-lg bg-[#0b3c81] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#082f67] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#0b3c81]">Preview message</button>
      <p role="status" className="text-sm text-gray-600">
        {previewComplete && 'Message preview complete.'}
      </p>
    </form>
  );
}

const demoOfficeHours = [
  ['Monday', '9 AM – 6 PM'],
  ['Tuesday', '9 AM – 6 PM'],
  ['Wednesday', '9 AM – 6 PM'],
  ['Thursday', '9 AM – 6 PM'],
  ['Friday', '9 AM – 6 PM'],
  ['Saturday', '10 AM – 4 PM'],
  ['Sunday', 'Closed'],
];

function DemoContact() {
  const [callPreview, setCallPreview] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="rounded-[14px] border border-[#4f8aaa] bg-[#e8f2fb] p-4 text-center">
        <button
          type="button"
          onClick={() => setCallPreview(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded px-1 text-[18px] font-bold text-[#0b1d51] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b3c81]"
          aria-label="Preview a call to the sample number, 202-555-0148"
        >
          <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M5 3h4l2 5-2.5 2a13 13 0 0 0 5.5 5.5l2-2.5 5 2v4a2 2 0 0 1-2 2C10.2 21 3 13.8 3 5a2 2 0 0 1 2-2Z" />
          </svg>
          +1 (202) 555-0148
        </button>
        <p role="status" className="text-[13px] text-[#334155]">
          {callPreview ? 'Call preview only. No call was placed.' : 'Sample phone number'}
        </p>
      </div>
      <div className="rounded-[14px] border border-[#4f8aaa] bg-[#e8f2fb] p-4 text-center">
        <h3 className="mb-3 text-[16px] font-bold text-[#0b1d51]">Sample office hours</h3>
        <dl className="mx-auto max-w-[16rem] space-y-2 text-[14px] font-medium text-[#334155]">
          {demoOfficeHours.map(([day, hours]) => (
            <div key={day} className="flex justify-between gap-2">
              <dt>{day}</dt>
              <dd>{hours}</dd>
            </div>
          ))}
        </dl>
      </div>
      <address className="mt-auto space-y-1 rounded-[14px] border border-[#4f8aaa] bg-[#e8f2fb] p-4 text-center text-[14px] not-italic text-[#334155]">
        <p className="font-bold text-[#0b1d51]">Sample Office</p>
        <p>100 Example Avenue</p>
        <p>Sample City</p>
      </address>
    </div>
  );
}

const weekDateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const dayLabelFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

function addDays(date, count) {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}

function DemoSchedule({ details }) {
  const [today] = useState(() => new Date());
  const [week, setWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [time, setTime] = useState('');
  const [previewComplete, setPreviewComplete] = useState(false);
  const days = Array.from({ length: 7 }, (_, index) => addDays(today, week * 7 + index));

  function changeWeek(nextWeek) {
    setWeek(nextWeek);
    setSelectedDay(null);
    setTime('');
    setPreviewComplete(false);
  }

  return (
    <form className="space-y-4" onSubmit={(event) => {
      event.preventDefault();
      if (selectedDay && time) setPreviewComplete(true);
    }}>
      <fieldset>
        <legend className="text-lg font-semibold text-gray-900">When would you like to visit?</legend>
        <p aria-live="polite" className="mb-3 mt-1 text-xs text-gray-600">
          {weekDateFormat.formatRange(days[0], days[6])}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {days.map(day => {
            const value = day.toDateString();
            return (
              <label key={value} className="relative block cursor-pointer">
                <input
                  type="radio"
                  name="demo-visit-date"
                  value={value}
                  checked={selectedDay === value}
                  onChange={() => { setSelectedDay(value); setTime(''); setPreviewComplete(false); }}
                  aria-label={dayLabelFormat.format(day)}
                  className="peer absolute left-2.5 top-2.5 h-3.5 w-3.5 accent-[#2b5a7d]"
                />
                <span aria-hidden="true" className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border border-gray-300 bg-white px-2 py-3 text-[#2b5a7d] peer-checked:border-[#2b5a7d] peer-checked:bg-blue-50 peer-focus-visible:ring-2 peer-focus-visible:ring-[#2b5a7d]">
                  <span className="text-xs text-gray-600">{weekdayFormat.format(day)}</span>
                  <span className="text-lg font-semibold">{day.getDate()}</span>
                </span>
              </label>
            );
          })}
          <button
            type="button"
            onClick={() => changeWeek(week + 1)}
            className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-lg border border-gray-300 bg-gray-50 text-xs font-semibold text-[#2b5a7d] hover:bg-blue-50"
          >
            <span aria-hidden="true" className="text-lg leading-none">→</span>
            Next week
          </button>
        </div>
        {week > 0 && (
          <button type="button" onClick={() => changeWeek(week - 1)} className="mt-2 min-h-7 text-xs font-semibold text-[#2b5a7d] underline">
            Previous week
          </button>
        )}
      </fieldset>
      {selectedDay && (
        <div className="space-y-2">
          <label className="block space-y-1 text-sm font-medium text-gray-700">
            <span>{details.eventName} time</span>
            <select required value={time} onChange={event => { setTime(event.target.value); setPreviewComplete(false); }} className={fieldClass}>
              <option value="" disabled>Choose a sample time</option>
              <option>10:00 AM</option>
              <option>1:00 PM</option>
              <option>3:30 PM</option>
            </select>
          </label>
          <button type="submit" className={buttonClass + ' w-full'}>{details.action}</button>
          <p role="status" className="text-sm text-gray-600">{previewComplete && details.confirmation}</p>
        </div>
      )}
    </form>
  );
}

export function DemoService({ service }) {
  const details = services[service];
  const prominent = service === 'email-us' || service === 'contact-us';
  return (
    <section aria-labelledby="demo-service-title" className={'flex flex-1 flex-col gap-4 ' + (prominent ? 'p-0' : 'p-2')}>
      <div className="space-y-1">
        {!prominent && <p className="text-xs font-semibold text-gray-500">Demo</p>}
        <h2 id="demo-service-title" className={prominent ? 'text-[29px] font-bold leading-[1.16] text-[#111a3a]' : 'text-xl font-semibold text-[#2b5a7d]'}>{details.title}</h2>
        {details.description && <p className={prominent ? 'text-[15px] leading-[1.4] text-[#1f2937]' : 'text-sm text-gray-600'}>{details.description}</p>}
      </div>
      {service === 'email-us' && <DemoEmailForm />}
      {service === 'contact-us' && <DemoContact />}
      {details.eventName && <DemoSchedule details={details} />}
    </section>
  );
}

export function DemoAiChat({ siteName, siteLogoUrl }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [liked, setLiked] = useState(false);
  const [attachment, setAttachment] = useState('');
  const messagesRef = useRef(null);
  const fileRef = useRef(null);
  const displayName = siteName || 'this business';

  useEffect(() => {
    const log = messagesRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  function ask(text) {
    const value = text.trim();
    if (!value) return;
    const prompt = prompts.find(item => item.label.toLowerCase() === value.toLowerCase());
    setMessages(previous => [...previous, {
      question: value,
      reply: prompt?.reply || 'This is a chat preview. A connected assistant could answer your question here.',
    }]);
    setQuestion('');
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white text-[#071849]">
      <div ref={messagesRef} role="log" aria-label="Chat preview conversation" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3 pt-4">


        <div className="flex items-start gap-2">
          <WidgetBrandAvatar imageUrl={siteLogoUrl} className="mt-5 h-10 w-10 border-2 border-[#e2a51b] p-1" />
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[12px] font-bold">Mia</p>
            <div className="rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#eef6ff] to-[#d9ebf8] px-3 py-3 text-[12px] leading-[1.5] text-[#071849]">
              <p>Hi! I&apos;m Mia, the preview assistant for {displayName}. I can show how a conversation will look here.</p>
              <p className="mt-3">What would you like to know next?</p>
            </div>
          </div>
        </div>
        {messages.map((message, index) => (
          <div key={index} className="space-y-3">
            <p className="ms-auto w-fit max-w-[90%] break-words rounded-xl bg-[#07317b] px-4 py-3 text-[12px] font-medium leading-snug text-white shadow-sm">
              {message.question}
            </p>
            <div className="flex items-start gap-2">
              <WidgetBrandAvatar imageUrl={siteLogoUrl} className="mt-5 h-10 w-10 border-2 border-[#e2a51b] p-1" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[12px] font-bold">Mia</p>
                <p className="rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#eef6ff] to-[#d9ebf8] px-3 py-3 text-[12px] leading-[1.5]">{message.reply}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="shrink-0 bg-white px-3 pb-3 pt-2">
        <div aria-label="Suggested questions" role="group" className="mb-3 flex flex-wrap justify-start gap-1.5">
          {prompts.map(prompt => (
            <button key={prompt.label} type="button" onClick={() => ask(prompt.label)} className="min-h-8 max-w-full rounded-lg border border-[#0b1d51] bg-white px-2 py-1 text-center text-[10px] font-semibold text-[#0b1d51] shadow-sm transition-colors hover:bg-blue-50 active:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b1d51]">
              {prompt.buttonLabel || prompt.label}
            </button>
          ))}
        </div>
        {attachment && <p role="status" className="mb-1 truncate text-[10px] text-slate-600">Selected for preview: {attachment}. Files are not sent.</p>}
        <form className="flex min-h-10 items-center gap-1 border-t border-slate-200" onSubmit={event => { event.preventDefault(); ask(question); }}>
          <input
            aria-label="Type a question"
            placeholder="Type and press Enter..."
            value={question}
            onChange={event => setQuestion(event.target.value)}
            maxLength={300}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[11px] text-[#071849] outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#0b1d51]"
          />
          <button type="button" aria-label={liked ? 'Remove helpful vote' : 'Mark preview helpful'} aria-pressed={liked} onClick={() => setLiked(value => !value)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#0b1d51] hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b1d51]">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Zm0 0 5-8a3 3 0 0 1 2 3v3h5a3 3 0 0 1 3 3l-1 7a3 3 0 0 1-3 3H7" /></svg>
          </button>
          <input ref={fileRef} type="file" tabIndex={-1} className="hidden" onChange={event => setAttachment(event.target.files?.[0]?.name || '')} />
          <button type="button" aria-label="Choose a file for preview" onClick={() => fileRef.current?.click()} className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#0b1d51] hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b1d51]">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="m8 12 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l8-8" /></svg>
          </button>
          <button type="button" aria-label="Insert smile emoji" onClick={() => setQuestion(value => value + ' 🙂')} className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#0b1d51] hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b1d51]">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8 14a4 4 0 0 0 8 0M9 9h.01M15 9h.01" /></svg>
          </button>
          {question.trim() && <button type="submit" aria-label="Send preview question" className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#07317b] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b1d51]">↗</button>}
        </form>
      </div>
    </div>
  );
}