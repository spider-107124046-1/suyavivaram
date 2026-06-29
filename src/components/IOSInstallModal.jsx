import React from 'react';

const IOSInstallModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-modal-in text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-teal-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Install Suyavivaram
          </h3>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-8.586a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6">
          <p className="text-slate-600 text-sm leading-relaxed">
            Install this application on your iOS home screen to quickly access it anytime and use it in full-screen mode.
          </p>

          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 font-bold text-sm">
              1
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">Tap the Share button</p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                Look for the Share icon 
                <span className="inline-block p-1 bg-slate-100 rounded text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l-2.006.91a4 4 0 100 7.7m0 0l2.006.91a4 4 0 115.836-5.836l-2.006-.91m0 0L9 12.5" />
                  </svg>
                </span> or 
                <span className="inline-block p-1 bg-slate-100 rounded text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </span> in Safari's menu.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 font-bold text-sm">
              2
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">Add to Home Screen</p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                Scroll down the list and tap 
                <span className="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-medium">
                  Add to Home Screen
                </span>
                with the 
                <span className="inline-block p-1 bg-slate-100 rounded text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span> icon.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all hover:shadow-lg"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallModal;
