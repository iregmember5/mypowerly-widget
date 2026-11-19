import { useEffect, useRef, useState } from 'react';

const fieldClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2b5a7d] focus:outline-none focus:ring-1 focus:ring-[#2b5a7d]';
const buttonClass = 'rounded-lg bg-[#2b5a7d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1e4a63] disabled:opacity-50';

const services = {
  'email-us': { title: 'Email Us', description: 'Write a sample message to the team.' },
  'contact-us': { title: 'Contact Us' },
  'schedule-an-appointment': { title: 'Schedule and Appointment', action: 'Preview appointment', confirmation: 'Appointment preview complete. No appointment was booked.', eventName: 'Appointment' },
  'schedule-a-tour': { title: 'Schedule a Tour', eventName: 'Tour', action: 'Preview booking', confirmation: 'Tour preview complete. No booking was made.' },
};

const prompts = [
  { label: 'Schedule a tour', reply: 'Try Schedule a Tour in the widget to preview choosing a date and time.' },
  { label: 'Pricing', reply: 'This demo doesn’t have current pricing. Try Email Us to preview contacting the team.' },
  { label: 'Office hours', reply: 'Office hours aren’t connected to this demo. Try Contact Us to preview that option.' },
  { label: 'Contact the team', reply: 'You can preview Email Us or Contact Us from the service menu.' },
];

const emailMessageLimit = 512;

function DemoEmailForm() {
  const [firstNameError, setFirstNameError] = useState(false);
  const [showTextDetails, setShowTextDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [previewComplete, setPreviewComplete] = useState(false);

  return (
    <form className="space-y-4" onSubmit={(event) => {
      event.preventDefault();
      setPreviewComplete(true);
    }} onChange={() => setPreviewComplete(false)}>
      <p className="text-xs text-gray-600">* Required fields</p>
      <div className="grid grid-cols-2 items-start gap-2">
        <label className="min-w-0 space-y-1 text-sm font-medium text-gray-700">
          <span>First name *</span>
          <input
            type="text"
            autoComplete="given-name"
            required
            className={fieldClass}
            aria-invalid={firstNameError || undefined}
            aria-describedby={firstNameError ? 'demo-first-name-error' : undefined}
            onInvalid={() => setFirstNameError(true)}
            onBlur={event => setFirstNameError(!event.currentTarget.value.trim())}
            onChange={event => { if (event.currentTarget.value.trim()) setFirstNameError(false); }}
          />
          {firstNameError && <span id="demo-first-name-error" className="block text-xs text-red-700">Enter your first name.</span>}
        </label>
        <label className="min-w-0 space-y-1 text-sm font-medium text-gray-700">
          <span>Last name *</span>
          <input type="text" autoComplete="family-name" required className={fieldClass} />
        </label>
      </div>
      <label className="block space-y-1 text-sm font-medium text-gray-700">
        <span>Email address *</span>
        <input type="email" autoComplete="email" required className={fieldClass} />
      </label>
      <label className="block space-y-1 text-sm font-medium text-gray-700">
        <span>Phone number *</span>
        <input type="tel" autoComplete="tel" required className={fieldClass} />
      </label>
      <div className="space-y-1">
        <label className="flex items-start gap-2 text-sm leading-5 text-gray-700">
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
      <label className="block space-y-1 text-sm font-medium text-gray-700">
        <span>Message *</span>
        <textarea
          required
          rows={4}
          maxLength={emailMessageLimit}
          value={message}
          onChange={event => setMessage(event.target.value)}
          aria-describedby="demo-email-character-count"
          className={fieldClass + ' resize-y'}
        />
        <span id="demo-email-character-count" className="block text-xs font-normal text-gray-600">
          {emailMessageLimit - message.length} characters left
        </span>
      </label>
      <p className="text-xs text-gray-600">Use sample details. This demo does not send email or texts.</p>
      <button type="submit" className={buttonClass + ' w-full'}>Preview message</button>
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
    <div className="flex flex-1 flex-col gap-5 text-center">
      <div>
        <button
          type="button"
          onClick={() => setCallPreview(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded px-1 text-base font-semibold text-[#2b5a7d] underline underline-offset-4"
          aria-label="Preview a call to the sample number, 202-555-0148"
        >
          <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M5 3h4l2 5-2.5 2a13 13 0 0 0 5.5 5.5l2-2.5 5 2v4a2 2 0 0 1-2 2C10.2 21 3 13.8 3 5a2 2 0 0 1 2-2Z" />
          </svg>
          +1 (202) 555-0148
        </button>
        <p role="status" className="text-xs text-gray-500">
          {callPreview ? 'Call preview only. No call was placed.' : 'Sample phone number'}
        </p>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Sample office hours</h3>
        <dl className="mx-auto max-w-[14rem] space-y-1.5 text-sm text-gray-600">
          {demoOfficeHours.map(([day, hours]) => (
            <div key={day} className="flex justify-between gap-2">
              <dt>{day}</dt>
              <dd>{hours}</dd>
            </div>
          ))}
        </dl>
      </div>
      <address className="mt-auto space-y-1 border-t border-gray-200 pt-4 text-sm not-italic text-gray-600">
        <p className="font-semibold text-gray-900">Sample Office</p>
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
  return (
    <section aria-labelledby="demo-service-title" className="flex flex-1 flex-col gap-4 p-2">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500">Demo</p>
        <h2 id="demo-service-title" className="text-xl font-semibold text-[#2b5a7d]">{details.title}</h2>
        {details.description && <p className="text-sm text-gray-600">{details.description}</p>}
      </div>
      {service === 'email-us' && <DemoEmailForm />}
      {service === 'contact-us' && <DemoContact />}
      {details.eventName && <DemoSchedule details={details} />}
    </section>
  );
}

export function DemoAiChat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

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
      reply: prompt?.reply ?? 'This is a demo reply. Try one of the suggested questions below to see how the chat works.',
    }]);
    setQuestion('');
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-b-lg bg-gray-50">
      <div ref={messagesRef} role="log" aria-label="Demo conversation" className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        <p className="text-xs font-semibold text-gray-500">AI Chat demo</p>
        <p className="max-w-[90%] rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700">
          Hi! I’m the MyPowerly demo assistant. Pick a suggestion or ask a question to try the chat.
        </p>
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            <p className="ml-auto w-fit max-w-[90%] break-words rounded-lg bg-[#2b5a7d] p-2.5 text-sm text-white">{message.question}</p>
            <p className="max-w-[90%] rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700">{message.reply}</p>
          </div>
        ))}
      </div>
      <div className="shrink-0 space-y-2 border-t border-gray-200 bg-white p-2.5">
        <div aria-label="Suggested questions" role="group" className="flex flex-wrap gap-1.5">
          {prompts.map(prompt => (
            <button key={prompt.label} type="button" onClick={() => ask(prompt.label)} className="rounded-full border border-[#2b5a7d] px-2.5 py-1 text-xs text-[#2b5a7d] hover:bg-gray-100">
              {prompt.label}
            </button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}>
          <input aria-label="Ask a question" placeholder="Ask me a question…" value={question} onChange={event => setQuestion(event.target.value)} maxLength={300} className={fieldClass + ' min-w-0'} />
          <button type="submit" disabled={!question.trim()} className={buttonClass}>Send</button>
        </form>
      </div>
    </div>
  );
}
