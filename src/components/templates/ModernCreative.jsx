import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  ModernAccordion,
  ModernTextInput,
  ModernTextArea,
  ReorderControl
} from '../FormInputs';
import {
  THEME_COLOR_STYLES
} from '../../utils/constants';
import { formatInline } from '../../utils/formatInline';
import {
  centerCrop,
  makeAspectCrop,
  generateUniqueId,
  isPlaceholderImage
} from '../../utils/helpers';

export const ModernCreativeEditor = ({ resumeData, setResumeData, photoFileInputRef, logoFileInputRef }) => {
  const [cropSrc, setCropSrc] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropTarget, setCropTarget] = useState(null);
  const imageRef = useRef(null);

  const handlePersonalDetailsChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [name]: value }
    }));
  };

  const handleSummaryChange = (e) => {
    setResumeData(prev => ({
      ...prev,
      summary: e.target.value
    }));
  };

  const handleSkillsChange = (e) => {
    const val = e.target.value;
    setResumeData(prev => ({
      ...prev,
      skills: [{ id: "skill-set-1", category: "", skills: val }]
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

  const handleReorderListItems = (section, zeroIndexedOrder) => {
    setResumeData(prev => {
      const list = prev[section] || [];
      const reorderedList = zeroIndexedOrder.map(idx => list[idx]);
      return {
        ...prev,
        [section]: reorderedList
      };
    });
  };

  const handleFileChange = (e, target) => {
    if (e.target.files && e.target.files.length > 0) {
      setCropTarget(target);
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
      setShowCropModal(true);
    }
  };

  function onImageLoad(e) {
    imageRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(makeAspectCrop({ unit: "%", width: 90 }, 1, width, height), width, height);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }

  const handleCropSave = () => {
    if (!completedCrop || !imageRef.current) return;
    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");
    const pixelRatio = window.devicePixelRatio;
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    // Fill white background so transparent areas don't render as black
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, completedCrop.width * scaleX, completedCrop.height * scaleY);
    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    const dataUrl = canvas.toDataURL("image/jpeg");
    const target = cropTarget;
    if (target) {
      setResumeData(prev => ({
        ...prev,
        personalDetails: { ...prev.personalDetails, [target]: dataUrl }
      }));
    }
    setShowCropModal(false);
    setCropSrc("");
    if (photoFileInputRef.current) photoFileInputRef.current.value = "";
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
  };

  return (
    <div className="p-4 bg-white relative">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Resume Editor</h1>

      {/* --- Personal Details --- */}
      <ModernAccordion
        title="Personal Details"
        defaultOpen={true}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      >
        <ModernTextInput label="Full Name" name="name" value={resumeData.personalDetails.name} onChange={handlePersonalDetailsChange} />
        <ModernTextInput label="Title/Degree" name="degree" value={resumeData.personalDetails.degree} onChange={handlePersonalDetailsChange} />
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Profile Photo</label>
          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp" onChange={(e) => handleFileChange(e, "photo")} ref={photoFileInputRef} className="hidden" />
          <button
            onClick={() => photoFileInputRef.current?.click()}
            className="w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 transition-all bg-white text-gray-600 text-sm font-medium"
          >
            Select Photo
          </button>
        </div>
        <ModernTextInput label="Date of Birth" name="dob" value={resumeData.personalDetails.dob} onChange={handlePersonalDetailsChange} />
        <ModernTextInput label="Email" name="email" value={resumeData.personalDetails.email} onChange={handlePersonalDetailsChange} />
        <ModernTextInput label="Contact" name="contact" value={resumeData.personalDetails.contact} onChange={handlePersonalDetailsChange} />
        <ModernTextInput label="LinkedIn URL" name="linkedin" value={resumeData.personalDetails.linkedin || ""} onChange={handlePersonalDetailsChange} />
        <ModernTextInput label="GitHub URL" name="github" value={resumeData.personalDetails.github || ""} onChange={handlePersonalDetailsChange} />
      </ModernAccordion>

      {/* --- Professional Summary --- */}
      <ModernAccordion
        title="Professional Summary"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        }
      >
        <ModernTextArea label="Summary" name="summary" rows={5} value={resumeData.summary} onChange={handleSummaryChange} />

      </ModernAccordion>

      {/* --- Education --- */}
      <ModernAccordion
        title="Education"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        }
      >
        <ReorderControl
          itemsCount={resumeData.education.length}
          onReorder={(order) => handleReorderListItems("education", order)}
          theme="purple"
        />
        {resumeData.education.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Education #{idx + 1}</h3>
            <ModernTextInput label="Degree" name="degree" value={item.degree} onChange={e => handleListItemChange("education", item.id, e)} />
            <ModernTextInput label="Institution" name="institution" value={item.institution} onChange={e => handleListItemChange("education", item.id, e)} />
            <ModernTextInput label="Year" name="year" value={item.year} onChange={e => handleListItemChange("education", item.id, e)} />
            <ModernTextInput label="Grade" name="grade" value={item.grade} onChange={e => handleListItemChange("education", item.id, e)} />
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("education", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("education", { id: generateUniqueId(), year: "", degree: "", institution: "", grade: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors font-semibold text-sm"
        >
          + Add Education
        </button>
      </ModernAccordion>

      {/* --- Experience --- */}
      <ModernAccordion
        title="Experience"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      >
        <ReorderControl
          itemsCount={resumeData.internships.length}
          onReorder={(order) => handleReorderListItems("internships", order)}
          theme="purple"
        />
        {resumeData.internships.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Experience #{idx + 1}</h3>
            <ModernTextInput label="Role Title" name="title" value={item.title} onChange={e => handleListItemChange("internships", item.id, e)} />
            <ModernTextInput label="Date" name="date" value={item.date} onChange={e => handleListItemChange("internships", item.id, e)} />
            <ModernTextArea label="Description" name="description" rows={4} value={item.description} onChange={e => handleListItemChange("internships", item.id, e)} />

            <div className="flex justify-end mt-3">
              <button
                onClick={() => handleRemoveListItem("internships", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("internships", { id: generateUniqueId(), title: "", date: "", description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors font-semibold text-sm"
        >
          + Add Experience
        </button>
      </ModernAccordion>

      {/* --- Projects --- */}
      <ModernAccordion
        title="Projects"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        }
      >
        <ReorderControl
          itemsCount={resumeData.projects.length}
          onReorder={(order) => handleReorderListItems("projects", order)}
          theme="purple"
        />
        {resumeData.projects.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Project #{idx + 1}</h3>
            <ModernTextInput label="Project Name" name="name" value={item.name} onChange={e => handleListItemChange("projects", item.id, e)} />
            <ModernTextInput label="Date" name="date" value={item.date} onChange={e => handleListItemChange("projects", item.id, e)} />
            <ModernTextArea label="Description" name="description" rows={4} value={item.description} onChange={e => handleListItemChange("projects", item.id, e)} />
            <div className="flex justify-end mt-3">
              <button
                onClick={() => handleRemoveListItem("projects", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("projects", { id: generateUniqueId(), name: "", date: "", description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors font-semibold text-sm"
        >
          + Add Project
        </button>
      </ModernAccordion>

      {/* --- Skills --- */}
      <ModernAccordion
        title="Skills"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      >
        <ModernTextArea label="Skills (Comma separated)" name="skills" value={resumeData.skills.map(c => c.skills).join(", ")} onChange={handleSkillsChange} rows={4} />
      </ModernAccordion>

      {/* --- Languages --- */}
      <ModernAccordion
        title="Languages"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.204 8.845a4 4 0 011.796 3.155H4a8 8 0 011.796-3.155M9 17v-4m0 0V9m0 4l-4-4m4 4l4-4" />
          </svg>
        }
      >
        <ReorderControl
          itemsCount={resumeData.languages.length}
          onReorder={(order) => handleReorderListItems("languages", order)}
          theme="purple"
        />
        {resumeData.languages.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Language #{idx + 1}</h3>
            <ModernTextInput label="Language" name="language" value={item.language} onChange={e => handleListItemChange("languages", item.id, e)} />
            <ModernTextInput label="Proficiency" name="proficiency" value={item.proficiency} onChange={e => handleListItemChange("languages", item.id, e)} />
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("languages", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("languages", { id: generateUniqueId(), language: "", proficiency: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors font-semibold text-sm"
        >
          + Add Language
        </button>
      </ModernAccordion>

      {/* --- Achievements --- */}
      <ModernAccordion
        title="Achievements"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        }
      >
        <ReorderControl
          itemsCount={resumeData.achievements.length}
          onReorder={(order) => handleReorderListItems("achievements", order)}
          theme="purple"
        />
        {resumeData.achievements.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Achievement #{idx + 1}</h3>
            <ModernTextArea label="Description" name="description" value={item.description} onChange={e => handleListItemChange("achievements", item.id, e)} />

            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("achievements", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("achievements", { id: generateUniqueId(), description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors font-semibold text-sm"
        >
          + Add Achievement
        </button>
      </ModernAccordion>

      {/* --- Activities --- */}
      <ModernAccordion
        title="Activities"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
      >
        {resumeData.activities.map((item) => (
          <div key={item.id} className="mb-4">
            <ModernTextArea label={item.title} name="description" value={item.description} onChange={e => handleListItemChange("activities", item.id, e)} />

          </div>
        ))}
      </ModernAccordion>

      {/* --- Crop Modal overlay (portal) --- */}
      {showCropModal && createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Crop Your Image</h2>
            {cropSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c, percentCrop) => setCrop(percentCrop)}
                onComplete={c => setCompletedCrop(c)}
                aspect={1}
              >
                <img ref={imageRef} alt="Crop me" src={cropSrc} onLoad={onImageLoad} style={{ maxHeight: "70vh" }} />
              </ReactCrop>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowCropModal(false); setCropSrc(""); }} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleCropSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">Crop & Save</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const ModernCreativeResumeLayout = forwardRef(({ resumeData, themeColor, dateItalics = true }, ref) => {
  const { personalDetails, education, internships, achievements, projects, skills, activities, summary, languages } = resumeData;

  const formatDates = text => {
    if (!text) return "";
    return text.replace(/<date\b([^>]*)\/?>/gi, (match, attrs) => {
      const fromMatch = attrs.match(/from="([^"]*)"/i);
      const toMatch = attrs.match(/to="([^"]*)"/i);
      const from = fromMatch ? fromMatch[1] : "";
      const to = toMatch ? toMatch[1] : "";
      let dateText = "";
      if (from && to) {
        dateText = `${from} – ${to}`;
      } else {
        dateText = from || to || "";
      }
      if (!dateText) return "";
      const fontStyle = dateItalics ? "italic" : "normal";
      return `<span class="subpoint-date" style="float: right; font-style: ${fontStyle}; font-weight: normal; font-size: inherit;">${dateText}</span>`;
    });
  };

  const formatBold = text => {
    if (!text) return '';
    const withDates = formatDates(text);
    return formatInline(withDates);
  };

  const colors = THEME_COLOR_STYLES[themeColor] || THEME_COLOR_STYLES["#2274a5"];

  return (
    <div
      ref={ref}
      className="flex w-full min-h-[297mm] text-black modern-creative-container"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      {/* Sidebar column (35%) */}
      <div
        className="w-[35%] px-6 pb-6 flex flex-col min-h-full flex-shrink-0 modern-creative-sidebar"
        style={{ backgroundColor: themeColor }}
      >
        {personalDetails.photo && (
          <div className="mb-8 flex justify-center pt-6">
            <img
              src={personalDetails.photo}
              alt="Profile"
              className="h-40 w-40 object-cover rounded-full border-4 shadow-xl"
              style={{ borderColor: colors.border }}
            />
          </div>
        )}
        <div className="mb-6">
          <h3
            className="text-sm font-bold uppercase tracking-widest border-b mb-3"
            style={{ borderColor: colors.border, color: colors.textSecondary }}
          >
            Contact
          </h3>
          <div className="space-y-3 text-sm" style={{ color: colors.textPrimary }}>
            {personalDetails.email && (
              <div className="flex items-center break-all">
                <img
                  src="assets/images/mail.png" alt="Email"
                  className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon"
                />
                <span>{personalDetails.email}</span>
              </div>
            )}
            {personalDetails.contact && (
              <div className="flex items-center">
                <img
                  src="assets/images/phone.png" alt="Phone"
                  className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon"
                />
                <span>{personalDetails.contact}</span>
              </div>
            )}
            {personalDetails.dob && (
              <div className="flex items-center">
                <img
                  src="assets/images/calendar.png" alt="DOB"
                  className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon"
                />
                <span>{personalDetails.dob}</span>
              </div>
            )}
            {personalDetails.linkedin && (
              <div className="flex items-center break-all">
                <img
                  src="assets/images/linkedin.png" alt="LinkedIn"
                  className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon"
                />
                <a
                  href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors" style={{ color: "inherit" }}
                >
                  {personalDetails.linkedin}
                </a>
              </div>
            )}
            {personalDetails.github && (
              <div className="flex items-center break-all">
                <img
                  src="assets/images/github.png" alt="GitHub"
                  className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon"
                />
                <a
                  href={personalDetails.github} target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors" style={{ color: "inherit" }}
                >
                  {personalDetails.github}
                </a>
              </div>
            )}
          </div>
        </div>
        {education && education.length > 0 && (
          <div className="mb-6">
            <h3
              className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-3"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Education
            </h3>
            <div className="space-y-4">
              {education.map((item, idx) => (
                <div key={idx}>
                  <h4 className="font-bold text-sm text-white">{item.degree}</h4>
                  <p className="text-xs mb-1" style={{ color: colors.textPrimary }}>{item.institution}</p>
                  <div className="flex justify-between text-xs" style={{ color: colors.textSecondary }}>
                    <span>{item.year}</span>
                    {item.grade && <span>{item.grade}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {skills && skills.length > 0 && (
          <div className="mb-6">
            <h3
              className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-3"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((item, keyIdx) => item.skills.split(",").map((sk, skIdx) => sk.trim() && (
                <span
                  key={`${keyIdx}-${skIdx}`}
                  className="inline-flex items-center justify-center px-2 py-1 text-xs rounded-md leading-none h-6 modern-creative-skill-tag"
                  style={{ backgroundColor: colors.tagBg, color: colors.textPrimary }}
                >
                  {sk.trim()}
                </span>
              )))}
            </div>
          </div>
        )}
        {languages && languages.length > 0 && (
          <div className="mb-6">
            <h3
              className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-3"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Languages
            </h3>
            <div className="space-y-2">
              {languages.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span style={{ color: colors.textPrimary }}>{item.language}</span>
                  <span className="text-xs" style={{ color: colors.textSecondary }}>{item.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right main column (65%) */}
      <div className="w-[65%] px-6 pb-6 flex flex-col bg-white modern-creative-right-column pt-10">
        <div className="mb-6">
          <h1 className="text-4xl font-black tracking-tight uppercase mb-2" style={{ color: themeColor }}>{personalDetails.name}</h1>
          <p className="text-xl text-slate-800 font-medium">{personalDetails.degree}</p>
        </div>
        {summary && (
          <div className="mb-5">
            <div className="flex items-center mb-3">
              <div className="w-1 h-8 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor, position: "relative", top: "3px" }} />
              <h2 className="text-lg font-bold uppercase text-slate-800">Professional Summary</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
          </div>
        )}
        {internships && internships.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center mb-3">
              <div className="w-1 h-8 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor, position: "relative", top: "3px" }} />
              <h2 className="text-lg font-bold uppercase text-slate-800">Experience</h2>
            </div>
            <div className="space-y-5">
              {internships.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-bold" style={{ color: themeColor }}>{item.title}</h3>
                    <span className="inline-flex items-center justify-center text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded leading-none h-6 modern-creative-date">{item.date}</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {projects && projects.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center mb-3">
              <div className="w-1 h-8 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor, position: "relative", top: "3px" }} />
              <h2 className="text-lg font-bold uppercase text-slate-800">Projects</h2>
            </div>
            <div className="space-y-5">
              {projects.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-bold" style={{ color: themeColor }}>{item.name}</h3>
                    <span className="inline-flex items-center justify-center text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded leading-none h-6 modern-creative-date">{item.date}</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed">
                    {item.description.includes("\n") ? (
                      <div className="space-y-1">
                        {item.description.split("\n").filter(line => line.trim()).map((line, lineIdx) => (
                          <div key={lineIdx} dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
                        ))}
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {achievements && achievements.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center mb-3">
              <div className="w-1 h-8 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor, position: "relative", top: "3px" }} />
              <h2 className="text-lg font-bold uppercase text-slate-800">Achievements</h2>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              {achievements.map((item, idx) => <div key={idx} dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />)}
            </div>
          </div>
        )}
        {activities && activities.some(item => item.description.trim() !== "") && (
          <div className="mb-5">
            <div className="flex items-center mb-3">
              <div className="w-1 h-8 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor, position: "relative", top: "3px" }} />
              <h2 className="text-lg font-bold uppercase text-slate-800">Activities</h2>
            </div>
            <div className="space-y-3">
              {activities.map((item, idx) => item.description.trim() !== "" && (
                <div key={idx}>
                  <h3 className="text-sm font-bold text-slate-700 mb-1">{item.title}</h3>
                  <div className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ModernCreativeResumeLayout.displayName = "ModernCreativeResumeLayout";

export const ModernCreativePreview = forwardRef(({ resumeData, themeColor, onPhotoUploadClick, isDownloading, dateItalics }, ref) => {
  const pagesContainerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getHtmlForPdf: () => pagesContainerRef.current
  }));

  return (
    <div ref={pagesContainerRef} className="flex flex-col items-center gap-8">
      <div className="relative">
        <div className="resume-page-container bg-white shadow-lg w-[210mm] min-h-[297mm] flex overflow-hidden">
          <ModernCreativeResumeLayout resumeData={resumeData} themeColor={themeColor} dateItalics={dateItalics} />
        </div>
        <button
          onClick={onPhotoUploadClick}
          className={`absolute left-[calc(17.5%-5rem)] h-40 w-40 rounded-full bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 ${isPlaceholderImage(resumeData.personalDetails.photo) ? "bg-opacity-50 opacity-100" : "bg-opacity-40 opacity-0 group-hover:opacity-100"
            }`}
          style={{ marginLeft: "0", top: isDownloading ? "26px" : "32px" }}
          aria-label="Select new photo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
});

ModernCreativePreview.displayName = "ModernCreativePreview";
