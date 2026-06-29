import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 ${
        isOpen ? 'bg-white/90 ring-1 ring-slate-200 shadow-md' : 'hover:bg-white/70'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex justify-between items-center focus:outline-none group"
      >
        <h3
          className={`text-lg font-bold pr-8 transition-colors ${
            isOpen ? 'text-cerulean' : 'text-slate-900 group-hover:text-slate-800'
          }`}
        >
          {question}
        </h3>
        <div
          className={`flex-shrink-0 ml-4 p-2 rounded-full transition-all duration-300 ${
            isOpen ? 'bg-cerulean/10 text-cerulean rotate-180' : 'bg-dimgrey/10 text-dimgrey group-hover:bg-dimgrey/20'
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100/50 pt-4">
          {answer}
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
      q: 'Is Suyavivaram free to use?',
      a: 'Yes, Suyavivaram is a completely free and open-source tool designed to help students generate professional resumes without any cost.'
    },
    {
      q: 'Do I need to create an account or sign in?',
      a: "No. We use a secure 'Stateless' architecture. You do not need to share your email, create a password, or log in. You can start building your resume immediately."
    },
    {
      q: 'Do you store my personal data or uploaded photos?',
      a: "Absolutely not. Your data lives only in your browser while you are typing. When you click 'Download', the data is sent to our server solely to generate the PDF file and is immediately wiped from memory. We do not have a database."
    },
    {
      q: 'Can I save my progress and come back later?',
      a: 'Since we value privacy and do not store your data, closing the browser tab will result in losing your progress. We recommend keeping the tab open until you have downloaded the final PDF.'
    },
    {
      q: 'Why does the download take a few seconds?',
      a: 'Unlike basic tools that take a screenshot, Suyavivaram spins up a real, high-fidelity browser engine on our server to ensure your margins, fonts, and layout are pixel-perfect. This high-quality rendering takes about 2-5 seconds.'
    },
    {
      q: 'Why did I get a \'Timeout\' error when downloading?',
      a: 'This usually happens if your Profile Photo or Institute Logo is extremely large (e.g., over 5MB). The server takes too long to process and download huge images. Please try compressing your images and uploading them again.'
    },
    {
      q: 'Why does my resume have 3 pages instead of 2?',
      a: 'Our automated layout engine ensures text is never cut in half. If your content is slightly too long for 2 pages, it will push the excess content to a 3rd page. We recommend shortening your project descriptions or bullet points to fit the standard 2-page limit.'
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
        <h1 className="text-4xl font-extrabold text-slate-900 mb-10 tracking-tight text-center">
          Frequently Asked Questions
        </h1>

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
