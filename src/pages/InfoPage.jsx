import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TABS = [
  { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { id: 'editor', label: 'Editor Tips', icon: '✏️' },
  { id: 'formatting', label: 'Formatting', icon: '🎨' },
  { id: 'saving', label: 'Saving & Exporting', icon: '💾' },
];

const FeatureCard = ({ icon, title, description, accent = 'cerulean' }) => {
  const accentMap = {
    cerulean: 'bg-cerulean/10 text-cerulean ring-cerulean/20',
    amber: 'bg-amber/10 text-amber ring-amber/20',
    paprika: 'bg-paprika/10 text-paprika ring-paprika/20',
    emerald: 'bg-emerald/10 text-emerald ring-emerald/20',
    dimgrey: 'bg-dimgrey/10 text-dimgrey ring-dimgrey/20',
    berry: 'bg-berry/10 text-berry ring-berry/20',
  };
  const cls = accentMap[accent] || accentMap.cerulean;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:bg-white/90 transition-all duration-200 p-5 flex gap-4 items-start group">
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl ring-1 ${cls} transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const Code = ({ children }) => (
  <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200">
    {children}
  </code>
);

const SectionHeading = ({ children }) => (
  <h2 className="text-xl font-extrabold text-slate-900 mb-5 mt-8 first:mt-0 flex items-center gap-2">
    <span className="block w-1 h-5 rounded-full bg-cerulean flex-shrink-0" />
    {children}
  </h2>
);

const CheatRow = ({ tag, example, rendered, shortcut, desc }) => (
  <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
    <td className="py-3 pr-4 font-mono text-sm text-slate-700 whitespace-nowrap">
      <Code>{tag}</Code>
    </td>
    <td className="py-3 pr-4 font-mono text-xs text-slate-500 hidden sm:table-cell whitespace-nowrap">
      {example}
    </td>
    <td className="py-3 pr-4 text-sm text-slate-800">{rendered}</td>
    <td className="py-3 pr-4 font-mono text-xs text-slate-600 whitespace-nowrap">
      <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 shadow-sm">{shortcut}</kbd>
    </td>
    <td className="py-3 text-sm text-slate-500">{desc}</td>
  </tr>
);

const GettingStartedTab = () => (
  <div>
    <SectionHeading>Welcome to Suyavivaram</SectionHeading>
    <p className="text-slate-600 mb-6 leading-relaxed">
      Suyavivaram (சுயவிவரம்) is an improved, browser-based resume builder focused on the{' '}
      <strong>NITT On-Campus template</strong>. Everything runs locally — no account, no cloud, no AI.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <FeatureCard
        icon="📄"
        title="Three Templates"
        description="On-Campus (NITT), Modern Creative, and Corporate Minimal — all editable in-browser."
        accent="cerulean"
      />
      <FeatureCard
        icon="🔄"
        title="Auto-Save"
        description="Your resume is silently saved to localStorage after every keystroke. Refresh without fear."
        accent="emerald"
      />
      <FeatureCard
        icon="📤"
        title="Load Your Config"
        description='Upload a previously exported ".json" config file from the landing page to resume exactly where you left off.'
        accent="amber"
      />
      <FeatureCard
        icon="📱"
        title="Install as a PWA"
        description="Install the app to your home screen for a native-like offline experience — no internet required!"
        accent="paprika"
      />
    </div>

    <SectionHeading>Quick Start</SectionHeading>
    <ol className="space-y-3 text-slate-600">
      {[
        ['Click "Get Started"', 'from the home page to browse templates.'],
        ['Pick a template', 'then click "Use This Template".'],
        ['Fill in your details', 'in the left-hand editor panel.'],
        ['Preview live', 'on the right — WYSIWYG, no surprises.'],
        ['Save as PDF', 'using the green PDF button in the toolbar. Allow the print popup.'],
        ['Export your config', 'with "Save Config" to preserve your data for next time.'],
      ].map(([bold, rest], i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cerulean text-white text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span><strong>{bold}</strong> {rest}</span>
        </li>
      ))}
    </ol>
  </div>
);

const EditorTab = () => (
  <div>
    <SectionHeading>Editor Panel</SectionHeading>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <FeatureCard
        icon="🔍"
        title="Zoom Control"
        description="Use the + / − buttons or type a percentage (e.g. 150%) in the zoom box. Reset brings it back to 100%."
        accent="cerulean"
      />
      <FeatureCard
        icon="—"
        title="En Dash Helper"
        description='Click the "Copy: –" button in the status bar to copy an en-dash (–) to your clipboard, then paste it anywhere.'
        accent="dimgrey"
      />
      <FeatureCard
        icon="🎯"
        title="Click-to-Edit Section"
        description="Click on any section header in the live resume preview to automatically expand, scroll to, and focus the corresponding edit form."
        accent="berry"
      />
      <FeatureCard
        icon="🔢"
        title="Reorder Section Items"
        description="Rearrange lists of items (like projects, work, or education) by entering a comma-separated list of indices (e.g. 3, 1, 2) in the Reorder items input."
        accent="emerald"
      />
      <FeatureCard
        icon="📐"
        title="Table Border Unlock (On-Campus)"
        description="Toggle hidden table borders to help align content precisely, then turn them off before exporting. Do not resize it too much!"
        accent="amber"
      />
    </div>

    <SectionHeading>Draft Management</SectionHeading>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <FeatureCard
        icon="💡"
        title="Restore Draft"
        description="If you navigate away and return, a modal will ask whether to restore your last auto-saved draft or start fresh."
        accent="emerald"
      />
      <FeatureCard
        icon="🟢"
        title="Save Status Indicator"
        description='The coloured dot in the top-left of the editor shows "Saving…" (amber ping), "Saved" (green), or an error (red).'
        accent="paprika"
      />
    </div>

    <SectionHeading>Photo & Logo Uploads</SectionHeading>
    <p className="text-slate-600 leading-relaxed text-sm">
      Click the placeholder image in the preview to upload your <strong>profile photo</strong>. For the On-Campus template, a separate logo picker lets you choose the <strong>NITT logo</strong> or upload your own institute logo. Both are embedded in the PDF. You cannot export a PDF until both are set.
    </p>
  </div>
);

const FormattingTab = () => (
  <div>
    <SectionHeading>Inline Rich Text</SectionHeading>
    <p className="text-slate-600 mb-6 leading-relaxed text-sm">
      Most text fields in the editor support a small set of <strong>inline HTML tags</strong> for formatting. Type the tags directly into the input — they will render in the preview and in the final PDF.
    </p>

    <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm bg-white/80 backdrop-blur-sm mb-8">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Tag</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Example</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Renders as</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Shortcut</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Effect</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 px-4">
          <CheatRow
            tag="<b>…</b>"
            example='<b>strong</b>'
            rendered={<strong>strong</strong>}
            shortcut="Ctrl+B / ⌘B"
            desc="Bold text"
          />
          <CheatRow
            tag="<i>…</i>"
            example='<i>emphasis</i>'
            rendered={<em>emphasis</em>}
            shortcut="Ctrl+I / ⌘I"
            desc="Italic text"
          />
          <CheatRow
            tag="<u>…</u>"
            example='<u>underline</u>'
            rendered={<u>underline</u>}
            shortcut="Ctrl+U / ⌘U"
            desc="Underlined text"
          />
          <CheatRow
            tag="<s>…</s>"
            example='<s>crossed</s>'
            rendered={<s>crossed</s>}
            shortcut="Ctrl+Shift+S / X"
            desc="Strikethrough"
          />
          <CheatRow
            tag='<date from="…" to="…"/>'
            example='<date from="May 24" to="Jul 24"/>'
            rendered={<span className="text-slate-500 italic">May 24 – Jul 24</span>}
            shortcut="Ctrl+D / ⌘D"
            desc="Right-aligned date range (styled using date italics settings)"
          />
          <CheatRow
            tag='<a href="…">…</a>'
            example='<a href="https://example.com">link</a>'
            rendered={<a href="#" className="text-cerulean underline">link</a>}
            shortcut="Ctrl+K / ⌘K"
            desc="Clickable hyperlink (opens in new tab)"
          />
        </tbody>
      </table>
    </div>

    <div className="bg-amber/10 border border-amber/20 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
      <span className="font-bold text-amber">⚠ Tip:</span> Tags can be nested. For example,{' '}
      <Code>{'<b><i>bold italic</i></b>'}</Code> renders as <strong><em>bold italic</em></strong>.{' '}
      Always close tags in the reverse order you opened them.
    </div>
  </div>
);

const SavingTab = () => (
  <div>
    <SectionHeading>Saving as PDF</SectionHeading>
    <p className="text-slate-600 mb-6 leading-relaxed text-sm">
      The <strong>PDF button</strong> (green, top toolbar) opens a new browser window with your resume laid out for printing. Your browser&apos;s &quot;Save as PDF&quot; option will produce a pixel-perfect, A4 document.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <FeatureCard
        icon="🖨️"
        title="Print to PDF"
        description="Allow the popup when prompted. The print dialog will open automatically — choose 'Save as PDF' as the destination."
        accent="emerald"
      />
      <FeatureCard
        icon="🚫"
        title="Popup Blocked?"
        description="If nothing happens, your browser blocked the popup. Allow popups for this site in your browser settings, then try again."
        accent="paprika"
      />
      <FeatureCard
        icon="📏"
        title="What You See = What You Get"
        description="The live preview uses the exact same styles as the print output. No more layout surprises between the editor and the PDF."
        accent="cerulean"
      />
      <FeatureCard
        icon="🖼️"
        title="Photos Must Be Set"
        description="The PDF button is blocked until you set all required images (photo + logo for On-Campus; photo for Modern Creative)."
        accent="amber"
      />
    </div>

    <SectionHeading>Exporting & Importing Config</SectionHeading>
    <p className="text-slate-600 mb-4 leading-relaxed text-sm">
      The <strong>Save Config</strong> button (dark slate, toolbar) downloads a <Code>.json</Code> file that captures your entire resume data, template choice, and theme colour.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <FeatureCard
        icon="📥"
        title="Load Config"
        description='On the home page, click "Load Resume" and select your saved .json file to instantly restore your resume.'
        accent="dimgrey"
      />
      <FeatureCard
        icon="☁️"
        title="No Cloud Required"
        description="Everything is stored in your browser's localStorage. Your data remains your responsibility."
        accent="cerulean"
      />
    </div>

    <SectionHeading>Auto-Save Details</SectionHeading>
    <p className="text-slate-600 leading-relaxed text-sm">
      Changes are debounced and saved to <Code>localStorage</Code> about <strong>1 second</strong> after you stop typing. <b>Each template has its own independent draft.</b> The status indicator in the editor&apos;s top bar always reflects the current save state.
    </p>
  </div>
);


const InfoPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('getting-started');

  const tabContent = {
    'getting-started': <GettingStartedTab />,
    'editor': <EditorTab />,
    'formatting': <FormattingTab />,
    'saving': <SavingTab />,
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-cerulean/20 flex flex-col">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-cerulean/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob" />
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[10%] w-[50vw] h-[50vw] bg-paprika/15 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000" />

      {/* Main Container */}
      <div className="relative z-10 flex-grow flex flex-col p-6 md:p-12 max-w-5xl mx-auto w-full">

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Info &amp; Help
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Documentation of this site.{' '}
            <Link to="/faq" className="text-cerulean hover:underline font-semibold">Visit the FAQ.</Link>
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                ? 'bg-white text-cerulean shadow-md ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          key={activeTab}
          className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 animate-fade-in"
        >
          {tabContent[activeTab]}
        </div>

        {/* Footer link */}
        <p className="text-center text-slate-400 text-sm mt-8 pb-4">
          Need help? Contact the dev via {' '}
          <a href="https://matrix.to/#/@pseudoforceyt:matrix.org" target="_blank" rel="noopener noreferrer" className="text-cerulean hover:underline font-semibold">
            Matrix.org
          </a>.
        </p>
      </div>
    </div>
  );
};

export default InfoPage;
