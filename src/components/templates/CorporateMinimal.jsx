import { useRef, useImperativeHandle, forwardRef } from 'react';
import {
  CorporateAccordion,
  CorporateTextInput,
  CorporateTextArea
} from '../FormInputs';
import {
  generateUniqueId
} from '../../utils/helpers';

export const CorporateMinimalEditor = ({ resumeData, setResumeData }) => {
  const handlePersonalDetailsChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [name]: value }
    }));
  };

  const handleListItemChange = (section, itemId, e) => {
    const { name, value } = e.target;
    setResumeData(prev => {
      const list = prev[section].map(item => item.id === itemId ? { ...item, [name]: value } : item);
      return { ...prev, [section]: list };
    });
  };

  const handleAddListItem = (section, itemTemplate) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], itemTemplate]
    }));
  };

  const handleRemoveListItem = (section, itemId) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== itemId)
    }));
  };

  return (
    <div className="p-4 bg-white relative">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Resume Editor</h1>

      {/* --- Personal Details --- */}
      <CorporateAccordion
        title="Personal Details"
        defaultOpen={true}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        }
      >
        <CorporateTextInput label="Full Name" name="name" value={resumeData.personalDetails.name} onChange={handlePersonalDetailsChange} />
        <CorporateTextInput label="Email" name="email" value={resumeData.personalDetails.email} onChange={handlePersonalDetailsChange} />
        <CorporateTextInput label="Contact" name="contact" value={resumeData.personalDetails.contact} onChange={handlePersonalDetailsChange} />
      </CorporateAccordion>

      {/* --- Education --- */}
      <CorporateAccordion
        title="Education"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        }
      >
        {resumeData.education.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <CorporateTextInput label="Institution" name="institution" value={item.institution} onChange={e => handleListItemChange("education", item.id, e)} />
            <CorporateTextInput label="Degree" name="degree" value={item.degree} onChange={e => handleListItemChange("education", item.id, e)} />
            <CorporateTextInput label="Date / Year" name="year" value={item.year} onChange={e => handleListItemChange("education", item.id, e)} />
            <CorporateTextInput label="Grade / Aggregate" name="grade" value={item.grade} onChange={e => handleListItemChange("education", item.id, e)} />
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("education", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("education", { id: generateUniqueId(), year: "", degree: "", institution: "", grade: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
        >
          + Add Education
        </button>
      </CorporateAccordion>

      {/* --- Links --- */}
      <CorporateAccordion
        title="Links"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        }
      >
        {resumeData.webLinks.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <CorporateTextInput label="Name (e.g. Github)" name="name" value={item.name} onChange={e => handleListItemChange("webLinks", item.id, e)} />
            <CorporateTextInput label="URL / Handle" name="url" value={item.url} onChange={e => handleListItemChange("webLinks", item.id, e)} />
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("webLinks", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("webLinks", { id: generateUniqueId(), name: "", url: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
        >
          + Add Link
        </button>
      </CorporateAccordion>

      {/* --- Coursework --- */}
      <CorporateAccordion
        title="Coursework"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
      >
        {resumeData.coursework.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <CorporateTextInput label="Category (e.g. Undergraduate)" name="category" value={item.category} onChange={e => handleListItemChange("coursework", item.id, e)} />
            <CorporateTextArea label="Subjects (One per line)" name="subjects" rows={4} value={item.subjects} onChange={e => handleListItemChange("coursework", item.id, e)} />
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("coursework", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("coursework", { id: generateUniqueId(), category: "", subjects: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
        >
          + Add Coursework
        </button>
      </CorporateAccordion>

      {/* --- Experience --- */}
      <CorporateAccordion
        title="Internship Experience"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      >
        {resumeData.internships.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <CorporateTextInput label="Role Title" name="title" value={item.title} onChange={e => handleListItemChange("internships", item.id, e)} />
            <CorporateTextInput label="Date" name="date" value={item.date} onChange={e => handleListItemChange("internships", item.id, e)} />
            <CorporateTextArea label="Description" name="description" rows={4} value={item.description} onChange={e => handleListItemChange("internships", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold.</p>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => handleRemoveListItem("internships", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("internships", { id: generateUniqueId(), title: "", date: "", description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
        >
          + Add Internship
        </button>
      </CorporateAccordion>

      {/* --- Projects --- */}
      <CorporateAccordion
        title="Projects"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        }
      >
        {resumeData.projects.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <CorporateTextInput label="Project Name | Tech Stack" name="name" value={item.name} onChange={e => handleListItemChange("projects", item.id, e)} />
            <CorporateTextInput label="Date" name="date" value={item.date} onChange={e => handleListItemChange("projects", item.id, e)} />
            <CorporateTextArea label="Description" name="description" rows={4} value={item.description} onChange={e => handleListItemChange("projects", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold.</p>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => handleRemoveListItem("projects", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("projects", { id: generateUniqueId(), name: "", date: "", description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
        >
          + Add Project
        </button>
      </CorporateAccordion>

      {/* --- Achievements & Interests --- */}
      <CorporateAccordion
        title="Achievements and Interests"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        }
      >
        {resumeData.achievements.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <CorporateTextArea label="Description" name="description" value={item.description} onChange={e => handleListItemChange("achievements", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold.</p>
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("achievements", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("achievements", { id: generateUniqueId(), description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
        >
          + Add Achievement
        </button>
      </CorporateAccordion>

      {/* --- Skills --- */}
      <CorporateAccordion
        title="Skills"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      >
        {resumeData.skills.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <CorporateTextInput label="Category (e.g. LANGUAGES)" name="category" value={item.category} onChange={e => handleListItemChange("skills", item.id, e)} />
            <CorporateTextArea label="Details" name="skills" value={item.skills} onChange={e => handleListItemChange("skills", item.id, e)} />
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("skills", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("skills", { id: generateUniqueId(), category: "", skills: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
        >
          + Add Skill
        </button>
      </CorporateAccordion>

      {/* --- Positions of Responsibility --- */}
      <CorporateAccordion
        title="Positions of Responsibility"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      >
        {resumeData.positions.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <CorporateTextArea label="Description" name="description" value={item.description} onChange={e => handleListItemChange("positions", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold.</p>
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("positions", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("positions", { id: generateUniqueId(), title: "", date: "", description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
        >
          + Add Position
        </button>
      </CorporateAccordion>

      {/* --- Extracurriculars --- */}
      <CorporateAccordion
        title="Extracurricular Activities"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
      >
        {resumeData.activities.map((item) => item.title === "EXTRACURRICULAR ACTIVITIES" && (
          <div key={item.id}>
            <CorporateTextArea label="Description (One per line)" name="description" rows={5} value={item.description} onChange={e => handleListItemChange("activities", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold.</p>
          </div>
        ))}
        {!resumeData.activities.some(item => item.title === "EXTRACURRICULAR ACTIVITIES") && (
          <button
            onClick={() => handleAddListItem("activities", { id: generateUniqueId(), title: "EXTRACURRICULAR ACTIVITIES", description: "" })}
            className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm"
          >
            + Add Extracurricular Section
          </button>
        )}
      </CorporateAccordion>
    </div>
  );
};

const CorporateMinimalBulletItem = ({ children }) => (
  <li className="relative pl-5 mb-1 last:mb-0 before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1.5 before:h-1.5 before:bg-gray-600 before:rounded-full leading-relaxed corporate-minimal-list-item">
    {children}
  </li>
);

const SectionHeader = ({ title }) => <h3 className="text-lg font-bold tracking-widest text-gray-800 uppercase mb-1">{title}</h3>;

export const CorporateMinimalResumeLayout = forwardRef(({ resumeData }, ref) => {
  const { personalDetails, education, projects, internships, achievements, skills, positions, activities, webLinks, coursework } = resumeData;
  const formatBold = text => text ? text.replace(/<b>/g, "<strong>").replace(/<\/b>/g, "</strong>").replace(/\n/g, "<br />") : "";

  return (
    <div
      ref={ref}
      className="bg-white min-h-[297mm] w-full px-8 pt-5 pb-8 text-gray-800"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      <header className="text-center mb-2">
        <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">{personalDetails.name}</h1>
        <div className="text-sm text-gray-600 flex justify-center items-center gap-2 mt-1 font-medium">
          {personalDetails.email && <span>{personalDetails.email}</span>}
          {personalDetails.email && personalDetails.contact && <span className="text-gray-400">|</span>}
          {personalDetails.contact && <span>{personalDetails.contact}</span>}
        </div>
      </header>
      <hr className="border-t border-gray-300 mb-5 -mx-8" />
      <div className="flex flex-row gap-6">
        {/* Left Column */}
        <div className="w-[35%] flex-shrink-0 flex flex-col gap-5">
          {education && education.length > 0 && (
            <section>
              <SectionHeader title="Education" />
              <div className="space-y-4">
                {education.map(item => (
                  <div key={item.id}>
                    <div className="font-bold text-base uppercase text-gray-900">{item.institution}</div>
                    <div className="font-bold text-sm text-gray-700">{item.degree}</div>
                    <div className="text-sm text-gray-600 italic">{item.year}</div>
                    <div className="text-sm text-gray-600">{item.grade}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {webLinks && webLinks.length > 0 && (
            <section>
              <SectionHeader title="Links" />
              <div className="space-y-1 text-sm">
                {webLinks.map(item => (
                  <div key={item.id}>
                    <span className="text-gray-600">{item.name}://</span>
                    {" "}
                    <span className="font-medium text-gray-700">{item.url}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {coursework && coursework.length > 0 && (
            <section>
              <SectionHeader title="Coursework" />
              <div className="space-y-3">
                {coursework.map(item => (
                  <div key={item.id}>
                    <div className="font-bold text-sm uppercase mb-1 text-gray-800">{item.category}</div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {item.subjects.split('\n').map((line, idx) => <div key={idx}>{line}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {skills && skills.length > 0 && (
            <section>
              <SectionHeader title="Skills" />
              <div className="space-y-3">
                {skills.map(item => (
                  <div key={item.id}>
                    <div className="font-bold text-sm uppercase mb-1 text-gray-800">{item.category}</div>
                    <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{item.skills}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="flex-grow flex flex-col gap-5">
          {internships && internships.length > 0 && (
            <section>
              <SectionHeader title="Internship Experience" />
              <div className="space-y-4">
                {internships.map(item => (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="font-bold text-base uppercase text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 italic font-medium">{item.date}</div>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {projects && projects.length > 0 && (
            <section>
              <SectionHeader title="Projects" />
              <div className="space-y-4">
                {projects.map(item => (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="font-bold text-base uppercase text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500 italic font-medium">{item.date}</div>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {achievements && achievements.length > 0 && (
            <section>
              <SectionHeader title="Achievements and Interests" />
              <ul className="text-sm text-gray-700">
                {achievements.map(item => (
                  <CorporateMinimalBulletItem key={item.id}>
                    <span dangerouslySetInnerHTML={{ __html: item.description }} />
                  </CorporateMinimalBulletItem>
                ))}
              </ul>
            </section>
          )}
          {positions && positions.length > 0 && (
            <section>
              <SectionHeader title="Positions of Responsibility" />
              <ul className="text-sm text-gray-700">
                {positions.map(item => (
                  <CorporateMinimalBulletItem key={item.id}>
                    <span dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
                  </CorporateMinimalBulletItem>
                ))}
              </ul>
            </section>
          )}
          {activities && activities.map(item => item.title.includes("EXTRA") && item.description && (
            <section key={item.id}>
              <SectionHeader title="Extracurricular Activities" />
              <ul className="text-sm text-gray-700">
                {item.description.split('\n').map((line, idx) => line.trim() && (
                  <CorporateMinimalBulletItem key={idx}>
                    <span dangerouslySetInnerHTML={{ __html: line.replace(/<b>/g, "<strong>").replace(/<\/b>/g, "</strong>") }} />
                  </CorporateMinimalBulletItem>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
});

CorporateMinimalResumeLayout.displayName = "CorporateMinimalResumeLayout";

export const CorporateMinimalPreview = forwardRef(({ resumeData }, ref) => {
  const pagesContainerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getHtmlForPdf: () => pagesContainerRef.current
  }));

  return (
    <div ref={pagesContainerRef} className="flex flex-col items-center gap-8">
      <div className="relative">
        <div className="resume-page-container bg-white shadow-lg w-[210mm] min-h-[297mm] flex overflow-hidden">
          <CorporateMinimalResumeLayout resumeData={resumeData} />
        </div>
      </div>
    </div>
  );
});

CorporateMinimalPreview.displayName = "CorporateMinimalPreview";
