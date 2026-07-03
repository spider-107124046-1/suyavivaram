import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': '\u00A0',
  '&ndash;': '–',
  '&mdash;': '—',
  '&laquo;': '«',
  '&raquo;': '»',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&hellip;': '…',
};

function decodeEntities(str) {
  // Named entities
  let out = str.replace(/&[a-z]+;/gi, m => ENTITIES[m] ?? m);
  // Numeric decimal entities e.g. &#8212;
  out = out.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  // Numeric hex entities e.g. &#x2014;
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return out;
}

const RichText = ({ text }) => {
  const TAG_RE = /<(\/?)([bius]|a)(?:\s+href="([^"]*)")?>/gi;
  const elements = [];
  const stack = [];
  let last = 0;
  let idx = 0;

  const allMatches = [...text.matchAll(TAG_RE)];

  const renderSegment = (str, keyPrefix) => {
    if (!str) return null;
    const decoded = decodeEntities(str);
    let node = <span key={keyPrefix}>{decoded}</span>;
    for (let i = stack.length - 1; i >= 0; i--) {
      const tag = stack[i];
      if (tag.name === 'b') node = <strong key={`${keyPrefix}-b${i}`}>{node}</strong>;
      else if (tag.name === 'i') node = <em key={`${keyPrefix}-i${i}`}>{node}</em>;
      else if (tag.name === 'u') node = <u key={`${keyPrefix}-u${i}`}>{node}</u>;
      else if (tag.name === 's') node = <s key={`${keyPrefix}-s${i}`}>{node}</s>;
      else if (tag.name === 'a') {
        node = (
          <a
            key={`${keyPrefix}-a${i}`}
            href={tag.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cerulean underline hover:text-cerulean/80 transition-colors font-medium"
          >
            {node}
          </a>
        );
      }
    }
    return node;
  };

  for (const m of allMatches) {
    const [fullMatch, closing, tagName, href] = m;
    const matchStart = m.index;

    if (matchStart > last) {
      elements.push(renderSegment(text.slice(last, matchStart), `t${idx++}`));
    }
    last = matchStart + fullMatch.length;

    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === tagName.toLowerCase()) {
          stack.splice(i, 1);
          break;
        }
      }
    } else {
      stack.push({ name: tagName.toLowerCase(), href: href || '' });
    }
  }

  if (last < text.length) {
    elements.push(renderSegment(text.slice(last), `t${idx++}`));
  }

  return <>{elements}</>;
};

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`backdrop-blur-sm rounded-2xl border shadow-sm transition-all duration-300 ${isOpen
        ? 'bg-white/95 border-cerulean/20 ring-1 ring-cerulean/10 shadow-md'
        : 'bg-white/70 border-slate-100 hover:bg-white/90 hover:border-slate-200'
        }`}
    >
      <button
        id={`faq-item-${index}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex justify-between items-center focus:outline-none group"
        aria-expanded={isOpen}
      >
        <h2
          className={`text-base font-bold pr-8 transition-colors leading-snug ${isOpen ? 'text-cerulean' : 'text-slate-900 group-hover:text-slate-700'
            }`}
        >
          {question}
        </h2>
        <div
          className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen
            ? 'bg-cerulean/10 text-cerulean rotate-180'
            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
          {typeof answer === 'string' ? <RichText text={answer} /> : answer}
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      q: "Isn't this a ripoff of resumify.live?",
      a: 'Yes, but not quite. Since they called their tool <b>"open-source"</b> (check their FAQ page) and have failed to make their source code public, this was <b>derived</b> from the static assets their website hosts. <i>Technically, every website (not its backend) is open source if you really think about it.</i>',
    },
    {
      q: 'Why did you do this if it already exists?',
      a: 'It is missing key features such as... <b>saving your progress!</b> Whether you download the PDF or not, once you refresh the page you can never get it back. Also, whatever you see in the preview is <i>not</i> what you get as the PDF. This derivative fixes that and adds a bunch more. <a href="/info">Check out the Info page!</a>',
    },
    {
      q: 'Where is the rest of the FAQ?',
      a: 'If you have questions, refer to the <a href="/info">Info page</a> ma, nobody ever asks me questions for this to be a truly <i>frequently</i> asked set of questions.',
    },
    {
      q: 'What rich text formatting is supported in the editor?',
      a: 'In text fields you can type inline HTML tags: &lt;b&gt; for <b>bold</b>, &lt;i&gt; for <i>italic</i>, &lt;u&gt; for <u>underline</u>, &lt;s&gt; for <s>strikethrough</s>, and &lt;a href="..."&gt; for hyperlinks. See the <a href="/info">Info page</a> for a full cheatsheet.',
    },
    {
      q: 'How different is this from resumify.live?',
      a: (
        <div>
          <p className="mb-3">Here’s what this version adds on top of the original:</p>
          <ul className="space-y-2">
            {[
              ['💾 Auto-save', 'Your resume is saved to localStorage after every edit. Refresh the page without losing anything.'],
              ['🗂️ Config export / import', 'Download your entire resume as a portable .json config file and reload it later from the home page.'],
              ['🎯 WYSIWYG PDF export', 'The live preview uses the exact same styles as the printed PDF — no more layout surprises.'],
              ['📝 Rich text in fields', 'Type <b>, <i>, <u>, <s>, and <a href> tags directly into text fields. HTML entities like &amp;amp; also work.'],
              ['📅 Date shorthand', 'Use <date from="Jan 2024" to="May 2024" /> in description fields to auto-format right-aligned italic date ranges.'],
              ['📏 Resizable table layout', 'The On-Campus template uses a real HTML table whose column widths you can drag to resize, with a toggle to reveal/hide borders for alignment.'],
              ['📱 PWA support', 'Install the site as an app on your phone or desktop for a fully offline, native-like experience.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-2 items-start">
                <span className="font-semibold text-slate-800 whitespace-nowrap">{title}:</span>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-cerulean/20 flex flex-col">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-amber/25 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cerulean/25 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[10%] w-[50vw] h-[50vw] bg-paprika/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000" />

      {/* Main Container */}
      <div className="relative z-10 flex-grow flex flex-col p-6 md:p-12 max-w-4xl mx-auto w-full">

        {/* Back Button */}
        <div className="w-full mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-dimgrey hover:text-cerulean transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cerulean/10 ring-1 ring-cerulean/20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cerulean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Looking for feature docs?{' '}
            <Link to="/info" className="text-cerulean hover:underline font-semibold">
              Visit the Info page.
            </Link>
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3 pb-10">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.q} answer={faq.a} index={index} />
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm pb-4">
          Still stuck? Check out the{' '}
          <Link to="/info" className="text-cerulean hover:underline font-semibold">
            Info page
          </Link>.
        </p>
      </div>
    </div>
  );
};

export default FAQPage;
