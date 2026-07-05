import { useState, useEffect, useRef } from 'react';

const useAccordionAutoOpen = (title, setIsOpen) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOpen = (e) => {
      if (e.detail && e.detail.title.toLowerCase() === title.toLowerCase()) {
        setIsOpen(true);
        setTimeout(() => {
          if (containerRef.current) {
            const scrollContainer = containerRef.current.closest('.overflow-y-auto');
            if (scrollContainer) {
              const elementTop = containerRef.current.offsetTop;
              scrollContainer.scrollTo({
                top: elementTop - 60,
                behavior: 'smooth'
              });
            } else {
              containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 150);
      }
    };
    window.addEventListener('open-resume-section', handleOpen);
    return () => {
      window.removeEventListener('open-resume-section', handleOpen);
    };
  }, [title, setIsOpen]);

  return containerRef;
};

export const OnCampusAccordion = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useAccordionAutoOpen(title, setIsOpen);
  return (
    <div ref={containerRef} className={`mb-5 rounded-xl transition-all duration-300 border ${isOpen ? "border-blue-400 shadow-md bg-white ring-1 ring-blue-100" : "border-gray-200 shadow-sm hover:border-blue-300 bg-white"}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none group rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"}`}>
            {icon || <div className="w-5 h-5 bg-gray-400 rounded-sm" />}
          </div>
          <span className={`text-lg font-bold transition-colors ${isOpen ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>{title}</span>
        </div>
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? "bg-blue-50 text-blue-600 rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <div className="h-px bg-gray-100 mb-5 mx-1" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OnCampusTextInput = ({ label, value, name, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
    <input
      type="text" name={name} value={value} onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export const OnCampusTextArea = ({ label, value, name, rows = 3, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
    <textarea
      name={name} value={value} rows={rows} onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm resize-y"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export const ModernAccordion = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useAccordionAutoOpen(title, setIsOpen);
  return (
    <div ref={containerRef} className={`mb-5 rounded-xl transition-all duration-300 border ${isOpen ? "border-purple-400 shadow-md bg-white ring-1 ring-purple-100" : "border-gray-200 shadow-sm hover:border-purple-300 bg-white"}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none group rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-500"}`}>
            {icon || <div className="w-5 h-5 bg-gray-400 rounded-sm" />}
          </div>
          <span className={`text-lg font-bold transition-colors ${isOpen ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>{title}</span>
        </div>
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? "bg-purple-50 text-purple-600 rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <div className="h-px bg-gray-100 mb-5 mx-1" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ModernTextInput = ({ label, value, name, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
    <input
      type="text" name={name} value={value} onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export const ModernTextArea = ({ label, value, name, rows = 3, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
    <textarea
      name={name} value={value} rows={rows} onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm resize-y"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export const CorporateAccordion = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useAccordionAutoOpen(title, setIsOpen);
  return (
    <div ref={containerRef} className={`mb-5 rounded-xl transition-all duration-300 border ${isOpen ? "border-emerald-400 shadow-md bg-white ring-1 ring-emerald-100" : "border-gray-200 shadow-sm hover:border-emerald-300 bg-white"}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none group rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-500"}`}>
            {icon || <div className="w-5 h-5 bg-gray-400 rounded-sm" />}
          </div>
          <span className={`text-lg font-bold transition-colors ${isOpen ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>{title}</span>
        </div>
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? "bg-emerald-50 text-emerald-600 rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <div className="h-px bg-gray-100 mb-5 mx-1" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CorporateTextInput = ({ label, value, name, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
    <input
      type="text" name={name} value={value} onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export const CorporateTextArea = ({ label, value, name, rows = 3, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
    <textarea
      name={name} value={value} rows={rows} onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm resize-y"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export const ResumeSection = ({ title, children, splittable = false }) => {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-resume-section', { detail: { title } }));
  };

  return (
    <div className="mb-6 break-inside-avoid resume-section-container" data-splittable={splittable}>
      <div className="flex items-center mb-1 section-header-flex">
        <h2 className="text-xl font-bold pr-4 flex-shrink-0" style={{ paddingBottom: "4px" }}>
          <span className="preview-clickable-header" data-section-title={title} onClick={handleClick}>{title}</span>
        </h2>
        <div className="flex-grow border-t-[2px] section-header-line" style={{ borderColor: "#C00000" }} />
      </div>
      {children}
    </div>
  );
};

export const ReorderControl = ({ itemsCount, onReorder, theme = "blue" }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  if (itemsCount <= 1) return null;

  const handleApply = () => {
    setError('');
    // Parse the input: e.g. "3, 1, 2" or "3,1, 2"
    const parts = value.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(Number);

    if (parts.length === 0) {
      setError('Please enter a list of indices, e.g. 2, 1');
      return;
    }

    // Validate that all numbers are within 1 to itemsCount
    const invalidNumbers = parts.filter(n => isNaN(n) || n < 1 || n > itemsCount);
    if (invalidNumbers.length > 0) {
      setError(`Indices must be between 1 and ${itemsCount}`);
      return;
    }

    // Check for duplicates
    const uniqueParts = new Set(parts);
    if (uniqueParts.size !== parts.length) {
      setError('Indices must be unique');
      return;
    }

    // Validate that all indices are included
    const expectedSet = new Set(Array.from({ length: itemsCount }, (_, i) => i + 1));
    const providedSet = new Set(parts);
    const missing = [...expectedSet].filter(x => !providedSet.has(x));
    if (missing.length > 0) {
      setError(`Missing indices: ${missing.join(', ')}`);
      return;
    }

    // Convert 1-indexed to 0-indexed indices
    const zeroIndexedOrder = parts.map(n => n - 1);
    onReorder(zeroIndexedOrder);
    setValue('');
  };

  // theme styling configuration
  const themeClasses = {
    blue: {
      bg: "bg-blue-50/50 border-blue-100",
      label: "text-blue-700",
      inputFocus: "focus:border-blue-500 focus:ring-blue-500",
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
    },
    purple: {
      bg: "bg-purple-50/50 border-purple-100",
      label: "text-purple-700",
      inputFocus: "focus:border-purple-500 focus:ring-purple-500",
      button: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
    },
    emerald: {
      bg: "bg-emerald-50/50 border-emerald-100",
      label: "text-emerald-700",
      inputFocus: "focus:border-emerald-500 focus:ring-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
    }
  };

  const style = themeClasses[theme] || themeClasses.blue;

  return (
    <div className={`mb-4 p-3.5 border rounded-xl ${style.bg} transition-all duration-200 shadow-sm`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
        <div className="flex-1">
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ml-1 ${style.label}`}>
            Reorder items
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. 3, 1, 2"
            className={`w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200 font-mono ${style.inputFocus}`}
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          className={`px-5 py-2 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-20 h-[38px] flex items-center justify-center shrink-0 ${style.button}`}
        >
          Apply Order
        </button>
      </div>
      {error && (
        <span className="text-xs text-red-500 font-semibold mt-1.5 ml-1 block">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};

