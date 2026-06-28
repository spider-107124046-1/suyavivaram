import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reconstructResumeData } from '../utils/helpers';

const LandingPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigateToTemplates = () => { navigate('/templates'); };
  const navigateToFAQ = () => { navigate('/faq'); };

  const handleLoadConfigClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const { resumeData, layout, themeColor } = reconstructResumeData(json);
        
        // Save in sessionStorage
        sessionStorage.setItem('uploadedResumeData', JSON.stringify(resumeData));
        sessionStorage.setItem('uploadedThemeColor', themeColor);
        
        // Navigate to the editor with correct template
        navigate(`/builder?template=${layout}`);
      } catch (err) {
        console.error("Invalid configuration file", err);
        setErrorMsg(err.message || "Failed to parse JSON file. Please make sure it's a valid resume config.");
        setTimeout(() => setErrorMsg(null), 5000);
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be loaded again
    e.target.value = "";
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-teal-100 flex flex-col">
      {/* --- Navigation Bar --- */}
      <nav className="relative z-50 flex items-center justify-end px-6 py-6 max-w-7xl mx-auto w-full">
        <button
          onClick={navigateToFAQ}
          className="text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-9 w-9"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </nav>

      {/* --- Animated Background Blobs --- */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-[#FDF6B2] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#99F6E4] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[10%] w-[50vw] h-[50vw] bg-[#FF7E67] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-[80px] opacity-60 z-0 pointer-events-none" />

      {/* --- Main Hero Content --- */}
      <div className="relative z-10 flex-grow flex flex-col justify-center items-center px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo + Brand */}
          <div className="flex justify-center items-center gap-3 mb-8">
            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg transform rotate-[-5deg]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Suyavivaram (சுயவிவரம்)</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
            Build your resume <br />
            <span className="text-slate-800">in minutes.</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create professional, ATS-friendly resumes with our real-time builder. Start from polished templates, format it perfectly, and stand out.
          </p>

          {/* Get Started and Load Resume Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={navigateToTemplates}
              className="px-8 py-4 bg-[#2EC4B6] hover:bg-[#25a599] text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3 min-w-[200px] justify-center"
            >
              <span>Get Started</span>
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="config-file-loader"
            />
            <button
              onClick={handleLoadConfigClick}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3 min-w-[200px] justify-center"
              id="load-resume-button"
            >
              <span>Load Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Error message banner --- */}
      {errorMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- Footer --- */}
      <footer className="relative z-10 py-6 text-center text-slate-500 text-sm font-medium">
      </footer>
    </div>
  );
};

export default LandingPage;
