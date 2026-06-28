import React, { useState } from 'react';

export const OnCampusAccordion = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`mb-5 rounded-xl transition-all duration-300 border ${isOpen ? "border-blue-400 shadow-md bg-white ring-1 ring-blue-100" : "border-gray-200 shadow-sm hover:border-blue-300 bg-white"}`}>
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
  return (
    <div className={`mb-5 rounded-xl transition-all duration-300 border ${isOpen ? "border-purple-400 shadow-md bg-white ring-1 ring-purple-100" : "border-gray-200 shadow-sm hover:border-purple-300 bg-white"}`}>
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
  return (
    <div className={`mb-5 rounded-xl transition-all duration-300 border ${isOpen ? "border-emerald-400 shadow-md bg-white ring-1 ring-emerald-100" : "border-gray-200 shadow-sm hover:border-emerald-300 bg-white"}`}>
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

export const ResumeSection = ({ title, children, splittable = false }) => (
  <div className="mb-6 break-inside-avoid resume-section-container" data-splittable={splittable}>
    <div className="flex items-center mb-1 section-header-flex">
      <h2 className="text-xl font-bold pr-4 flex-shrink-0" style={{ paddingBottom: "4px" }}>{title}</h2>
      <div className="flex-grow border-t-[4px] section-header-line" style={{ borderColor: "#C00000" }} />
    </div>
    {children}
  </div>
);
