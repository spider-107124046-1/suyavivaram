import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * RichText — renders a subset of HTML inline tags from a string:
 *   <b>…</b>  → bold
 *   <i>…</i>  → italic
 *   <u>…</u>  → underline
 *   <s>…</s>  → strikethrough
 *   <a href="…">…</a> → external link (opens in new tab)
 */
const RichText = ({ text }) => {
  // Tokenise the string into plain-text chunks and tag nodes.
  const TAG_RE = /<(\/?)([bius]|a)(?:\s+href="([^"]*)")?>/gi;
  const elements = [];
  let last = 0;
  let match;
  const stack = []; // tracks open formatting tags

  // Walk through every recognised tag in the string
  const allMatches = [...text.matchAll(TAG_RE)];

  const renderSegment = (str, keyPrefix) => {
    if (!str) return null;
    // Apply current stack of formatting as nested spans
    let node = <span key={keyPrefix}>{str}</span>;
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

  let idx = 0;
  for (const m of allMatches) {
    const [fullMatch, closing, tagName, href] = m;
    const matchStart = m.index;

    // Push any plain text before this tag
    if (matchStart > last) {
      elements.push(renderSegment(text.slice(last, matchStart), `t${idx++}`));
    }
    last = matchStart + fullMatch.length;

    if (closing) {
      // Pop the matching open tag from the stack
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

  // Push any remaining plain text after the last tag
  if (last < text.length) {
    elements.push(renderSegment(text.slice(last), `t${idx++}`));
  }

  return <>{elements}</>;
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 ${isOpen ? 'bg-white/90 ring-1 ring-slate-200 shadow-md' : 'hover:bg-white/70'
        }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex justify-between items-center focus:outline-none group"
      >
        <h3
          className={`text-lg font-bold pr-8 transition-colors ${isOpen ? 'text-cerulean' : 'text-slate-900 group-hover:text-slate-800'
            }`}
        >
          {question}
        </h3>
        <div
          className={`flex-shrink-0 ml-4 p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-cerulean/10 text-cerulean rotate-180' : 'bg-dimgrey/10 text-dimgrey group-hover:bg-dimgrey/20'
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100/50 pt-4">
          <RichText text={answer} />
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const navigate = useNavigate();

  const navigateBack = () => { navigate('/'); };

  const faqs = [
    {
      q: 'Isn\'t this a ripoff of resumify.live?',
      a: 'Yes, but not quite. Since they called their tool <b>"open-source"</b> (check their FAQ page) and have failed to make their source code public, this was <b>derived</b> from the static assets their website hosts. <i>Technically, every website (not its backend) is open source if you really think about it.</i>'
    },
    {
      q: 'Why did you do this to yourself if it already exists?',
      a: 'It is missing key features such as... <b>saving your progress!</b> Whether you download the PDF or not, once you refresh the page you can never get it back unless you decide to sit and fill everything in again. Also, whatever you see in the preview is <i>not</i> what you get as the PDF. This derivative fixes that and adds a bunch more. <a href="/info">Check out the Info page!</a>'
    },
    {
      q: 'Where is the rest of the FAQ?',
      a: 'If you have questions, refer to the <a href="/info">Info page</a> — nobody ever asks me questions for this to be a truly <i>frequently</i> asked set of questions.'
    },
    {
      q: 'What rich text formatting is supported in the editor?',
      a: 'In text fields you can use inline HTML tags: <b>&lt;b&gt;bold&lt;/b&gt;</b>, <i>&lt;i&gt;italic&lt;/i&gt;</i>, <u>&lt;u&gt;underline&lt;/u&gt;</u>, <s>&lt;s&gt;strikethrough&lt;/s&gt;</s>, and <b>&lt;a href="..."&gt;hyperlinks&lt;/a&gt;</b>. See the <a href="/info">Info page</a> for a full cheatsheet.'
    }
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
            onClick={navigateBack}
            className="flex items-center text-dimgrey hover:text-cerulean transition-colors font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-slate-500 mb-10">
          Looking for feature docs? Visit the{' '}
          <Link to="/info" className="text-cerulean hover:underline font-semibold">
            Info page
          </Link>.
        </p>

        {/* Accordion List */}
        <div className="space-y-4 overflow-y-auto pb-10">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
