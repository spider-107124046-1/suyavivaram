import { useState, useEffect, useRef, useLayoutEffect, useImperativeHandle, forwardRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { formatInline } from '../../utils/formatInline';
import {
  OnCampusAccordion,
  OnCampusTextInput,
  OnCampusTextArea,
  ResumeSection,
  ReorderControl
} from '../FormInputs';
import {
  PAGE_HEIGHT_PX
} from '../../utils/constants';
import {
  centerCrop,
  makeAspectCrop,
  generateUniqueId,
  isPlaceholderImage
} from '../../utils/helpers';

export const OnCampusEditor = ({ resumeData, setResumeData, photoFileInputRef, logoFileInputRef, unlockTableBorders, setUnlockTableBorders }) => {
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

  const handleUseDefaultLogo = () => {
    const logoPath = "assets/images/NITTLogo.png";
    setResumeData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, logo: logoPath }
    }));
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
    const aspect = cropTarget === "logo" ? 1 : 130 / 140;
    const initialCrop = centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height);
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

      {/* --- Line Spacing Slider --- */}
      <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="line-spacing-slider" className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 select-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Line Spacing
          </label>
          <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg select-none">
            {(resumeData.lineSpacing || 1.625).toFixed(2)}x
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="line-spacing-slider"
            type="range"
            min="1.4"
            max="1.8"
            step="0.01"
            value={resumeData.lineSpacing || 1.625}
            onChange={(e) => {
              const val = parseFloat(parseFloat(e.target.value).toFixed(3));
              setResumeData(prev => ({
                ...prev,
                lineSpacing: val
              }));
            }}
            className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            onClick={() => {
              setResumeData(prev => ({
                ...prev,
                lineSpacing: 1.625
              }));
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0 focus:outline-none focus:underline"
            title="Reset to default line spacing"
          >
            Reset
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 ml-1 select-none">
          Adjust the content line height to fit your text perfectly on the pages.
        </p>
      </div>

      {/* --- Personal Details accordion --- */}
      <OnCampusAccordion
        title="Personal Details"
        defaultOpen={true}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      >
        <OnCampusTextInput label="Full Name" name="name" value={resumeData.personalDetails.name} onChange={handlePersonalDetailsChange} />
        <OnCampusTextInput label="Roll No." name="rollNo" value={resumeData.personalDetails.rollNo || ""} onChange={handlePersonalDetailsChange} />
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Profile Photo</label>
          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp" onChange={(e) => handleFileChange(e, "photo")} ref={photoFileInputRef} className="hidden" />
          <button
            onClick={() => photoFileInputRef.current?.click()}
            className="w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-white text-gray-600 text-sm font-medium"
          >
            Select Photo
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Institute Logo</label>
          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp" onChange={(e) => handleFileChange(e, "logo")} ref={logoFileInputRef} className="hidden" />
          <div className="flex gap-2">
            <button
              onClick={handleUseDefaultLogo}
              className="w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-white text-gray-600 text-sm font-medium"
            >
              NITT Logo
            </button>
            <button
              onClick={() => logoFileInputRef.current?.click()}
              className="w-1/2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-white text-gray-600 text-sm font-medium"
            >
              Select Logo
            </button>
          </div>
        </div>
        <OnCampusTextInput label="Degree" name="degree" value={resumeData.personalDetails.degree} onChange={handlePersonalDetailsChange} />
        <OnCampusTextInput label="Gender" name="gender" value={resumeData.personalDetails.gender} onChange={handlePersonalDetailsChange} />
        <OnCampusTextInput label="Date of Birth" name="dob" value={resumeData.personalDetails.dob} onChange={handlePersonalDetailsChange} />
        <OnCampusTextInput label="Email" name="email" value={resumeData.personalDetails.email} onChange={handlePersonalDetailsChange} />
        <OnCampusTextInput label="Contact" name="contact" value={resumeData.personalDetails.contact} onChange={handlePersonalDetailsChange} />
      </OnCampusAccordion>

      {/* --- Education accordion --- */}
      <OnCampusAccordion
        title="Educational Qualification"
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
          theme="blue"
        />
        {resumeData.education.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Education #{idx + 1}</h3>
            <OnCampusTextInput label="Year" name="year" value={item.year} onChange={e => handleListItemChange("education", item.id, e)} />
            <OnCampusTextInput label="Degree/Examination" name="degree" value={item.degree} onChange={e => handleListItemChange("education", item.id, e)} />
            <OnCampusTextInput label="Institution/Board" name="institution" value={item.institution} onChange={e => handleListItemChange("education", item.id, e)} />
            <OnCampusTextInput label="CGPA/Percentage" name="grade" value={item.grade} onChange={e => handleListItemChange("education", item.id, e)} />
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("education", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove Education
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("education", { id: generateUniqueId(), year: "", degree: "", institution: "", grade: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm"
        >
          + Add Education
        </button>

        {/* Unlock table layout controls */}
        <div className="mt-4 p-3 bg-amber-50/70 border border-amber-100 rounded-xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="edu-unlock-table"
              checked={!!unlockTableBorders}
              onChange={(e) => {
                setUnlockTableBorders(e.target.checked);
              }}
              className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
            />
            <label htmlFor="edu-unlock-table" className="text-xs font-semibold text-amber-800 cursor-pointer select-none flex-1">
              Unlock table layout
              <span className="block font-normal text-amber-600 mt-0.5">Drag column/row dividers on the preview to resize</span>
            </label>
            {(unlockTableBorders || resumeData.educationColWidths || resumeData.educationRowHeights) && (
              <button
                onClick={() => {
                  setResumeData(prev => ({
                    ...prev,
                    educationColWidths: null,
                    educationRowHeights: null,
                  }));
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 shrink-0"
                title="Reset column and row sizes to automatic (content-driven)"
              >
                Reset sizes
              </button>
            )}
          </div>
        </div>
      </OnCampusAccordion>

      {/* --- Academic Achievements accordion --- */}
      <OnCampusAccordion
        title="Academic Achievements"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        }
      >
        <ReorderControl
          itemsCount={resumeData.achievements.length}
          onReorder={(order) => handleReorderListItems("achievements", order)}
          theme="blue"
        />
        {resumeData.achievements.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Achievement #{idx + 1}</h3>
            <OnCampusTextArea label="Description" name="description" value={item.description} onChange={e => handleListItemChange("achievements", item.id, e)} />

            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("achievements", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove Achievement
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("achievements", { id: generateUniqueId(), description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm"
        >
          + Add Achievement
        </button>
      </OnCampusAccordion>

      {/* --- Internship Experience accordion --- */}
      <OnCampusAccordion
        title="Internship Experience"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      >
        <ReorderControl
          itemsCount={resumeData.internships.length}
          onReorder={(order) => handleReorderListItems("internships", order)}
          theme="blue"
        />
        {resumeData.internships.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Internship #{idx + 1}</h3>
            <OnCampusTextInput label="Title" name="title" value={item.title} onChange={e => handleListItemChange("internships", item.id, e)} />
            <div className="flex gap-4">
              <div className="flex-1">
                <OnCampusTextInput label="From" name="from" value={item.from || ""} onChange={e => handleListItemChange("internships", item.id, e)} />
              </div>
              <div className="flex-1">
                <OnCampusTextInput label="To" name="to" value={item.to || ""} onChange={e => handleListItemChange("internships", item.id, e)} />
              </div>
            </div>
            <OnCampusTextArea label="Description" name="description" rows={5} value={item.description} onChange={e => handleListItemChange("internships", item.id, e)} />

            <div className="flex justify-end mt-3">
              <button
                onClick={() => handleRemoveListItem("internships", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove Internship
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("internships", { id: generateUniqueId(), title: "", from: "", to: "", description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm"
        >
          + Add Internship
        </button>
      </OnCampusAccordion>

      {/* --- Projects accordion --- */}
      <OnCampusAccordion
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
          theme="blue"
        />
        {resumeData.projects.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Project #{idx + 1}</h3>
            <OnCampusTextInput label="Name" name="name" value={item.name} onChange={e => handleListItemChange("projects", item.id, e)} />
            <div className="flex gap-4">
              <div className="flex-1">
                <OnCampusTextInput label="From" name="from" value={item.from || ""} onChange={e => handleListItemChange("projects", item.id, e)} />
              </div>
              <div className="flex-1">
                <OnCampusTextInput label="To" name="to" value={item.to || ""} onChange={e => handleListItemChange("projects", item.id, e)} />
              </div>
            </div>
            <OnCampusTextArea label="Description" name="description" rows={5} value={item.description} onChange={e => handleListItemChange("projects", item.id, e)} />
            <div className="flex justify-end mt-3">
              <button
                onClick={() => handleRemoveListItem("projects", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove Project
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("projects", { id: generateUniqueId(), name: "", from: "", to: "", description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm"
        >
          + Add Project
        </button>
      </OnCampusAccordion>

      {/* --- Technical Skills accordion --- */}
      <OnCampusAccordion
        title="Technical Skills and Certifications"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      >
        <OnCampusTextArea
          label="Description"
          name="skillsDescription"
          value={resumeData.skillsDescription || ""}
          onChange={(e) => {
            const { value } = e.target;
            setResumeData(prev => ({
              ...prev,
              skillsDescription: value
            }));
          }}
          rows={3}
        />
        <ReorderControl
          itemsCount={resumeData.skills.length}
          onReorder={(order) => handleReorderListItems("skills", order)}
          theme="blue"
        />
        {resumeData.skills.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Skill #{idx + 1}</h3>
            <OnCampusTextInput label="Category" name="category" value={item.category} onChange={e => handleListItemChange("skills", item.id, e)} />
            <OnCampusTextInput label="Skills" name="skills" value={item.skills} onChange={e => handleListItemChange("skills", item.id, e)} />
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveListItem("skills", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove Skill
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("skills", { id: generateUniqueId(), category: "", skills: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm"
        >
          + Add Skill
        </button>
      </OnCampusAccordion>

      {/* --- Positions of Responsibility accordion --- */}
      <OnCampusAccordion
        title="Positions of Responsibility"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      >
        <ReorderControl
          itemsCount={resumeData.positions.length}
          onReorder={(order) => handleReorderListItems("positions", order)}
          theme="blue"
        />
        {resumeData.positions.map((item, idx) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Position #{idx + 1}</h3>
            <OnCampusTextInput label="Title" name="title" value={item.title} onChange={e => handleListItemChange("positions", item.id, e)} />
            <div className="flex gap-4">
              <div className="flex-1">
                <OnCampusTextInput label="From" name="from" value={item.from || ""} onChange={e => handleListItemChange("positions", item.id, e)} />
              </div>
              <div className="flex-1">
                <OnCampusTextInput label="To" name="to" value={item.to || ""} onChange={e => handleListItemChange("positions", item.id, e)} />
              </div>
            </div>
            <OnCampusTextArea label="Description" name="description" value={item.description} onChange={e => handleListItemChange("positions", item.id, e)} />

            <div className="flex justify-end mt-3">
              <button
                onClick={() => handleRemoveListItem("positions", item.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors"
              >
                Remove Position
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddListItem("positions", { id: generateUniqueId(), title: "", from: "", to: "", description: "" })}
          className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm"
        >
          + Add Position
        </button>
      </OnCampusAccordion>

      {/* --- Extracurriculars accordion --- */}
      <OnCampusAccordion
        title="Extracurricular Activities"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
      >
        {resumeData.activities.map(item => (
          <div key={item.id} className="mb-4">
            <OnCampusTextArea label={item.title} name="description" value={item.description} onChange={e => handleListItemChange("activities", item.id, e)} />
          </div>
        ))}
      </OnCampusAccordion>

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
                aspect={cropTarget === "logo" ? 1 : 130 / 140}
              >
                <img ref={imageRef} alt="Crop me" src={cropSrc} onLoad={onImageLoad} style={{ maxHeight: "70vh" }} />
              </ReactCrop>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowCropModal(false); setCropSrc(""); }} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleCropSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Crop & Save</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const MIN_COL_PX = 16; // ≈ 2ch
const MIN_ROW_PX = 2;  // 2 px

const ResizableEduTable = ({ education, unlocked, colWidths, rowHeights, onTableChange }) => {
  const tableRef = useRef(null);
  const dragStateRef = useRef(null);

  const handleColDragStart = (e, colIdx) => {
    if (!unlocked) return;
    e.preventDefault();
    e.stopPropagation();

    const table = tableRef.current;
    const totalWidth = table.getBoundingClientRect().width;

    // Resolve current column widths as percentages
    let startPcts;
    if (colWidths) {
      startPcts = [...colWidths];
    } else {
      const headerCells = Array.from(table.querySelectorAll('thead tr:not(.edu-rh-tr) th'));
      const pxWidths = headerCells.map(th => th.getBoundingClientRect().width);
      const total = pxWidths.reduce((a, b) => a + b, 0) || totalWidth;
      startPcts = pxWidths.map(w => (w / total) * 100);
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragStateRef.current = { type: 'col', colIdx, startX: clientX, startPcts, totalWidth };

    const onMove = (me) => {
      if (!dragStateRef.current) return;
      if (me.cancelable) me.preventDefault();
      const cx = me.touches ? me.touches[0].clientX : me.clientX;
      const dxPx = cx - dragStateRef.current.startX;
      const dxPct = (dxPx / dragStateRef.current.totalWidth) * 100;
      const minPct = (MIN_COL_PX / dragStateRef.current.totalWidth) * 100;
      const { startPcts: sp, colIdx: ci } = dragStateRef.current;
      const newPcts = [...sp];
      const sumLR = sp[ci] + sp[ci + 1];
      newPcts[ci] = Math.max(minPct, Math.min(sumLR - minPct, sp[ci] + dxPct));
      newPcts[ci + 1] = sumLR - newPcts[ci];
      onTableChange(newPcts, rowHeights);
    };

    const onUp = () => {
      dragStateRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
  };

  // ── Row drag ─────────────────────────────────────────────────────────────
  // rowIdx = index into the heights array (0 = header, 1..N = data rows)
  // The handle between row[rowIdx] and row[rowIdx+1] resizes row[rowIdx].
  const handleRowDragStart = (e, rowIdx) => {
    if (!unlocked) return;
    e.preventDefault();
    e.stopPropagation();

    const table = tableRef.current;
    // Collect real data rows (exclude handle rows)
    const allRealTrs = Array.from(table.querySelectorAll('tr:not(.edu-rh-tr)'));
    let startHeights;
    if (rowHeights) {
      startHeights = [...rowHeights];
    } else {
      startHeights = allRealTrs.map(tr => tr.getBoundingClientRect().height);
    }

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStateRef.current = { type: 'row', rowIdx, startY: clientY, startHeights };

    const onMove = (me) => {
      if (!dragStateRef.current) return;
      if (me.cancelable) me.preventDefault();
      const cy = me.touches ? me.touches[0].clientY : me.clientY;
      const dy = cy - dragStateRef.current.startY;
      const { startHeights: sh, rowIdx: ri } = dragStateRef.current;
      const newHeights = [...sh];
      newHeights[ri] = Math.max(MIN_ROW_PX, sh[ri] + dy);
      onTableChange(colWidths, newHeights);
    };

    const onUp = () => {
      dragStateRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
  };

  const columns = ['Year', 'Degree/Examination', 'Institution/Board', 'CGPA/Percentage'];
  const dataKeys = ['year', 'degree', 'institution', 'grade'];

  // Shared style for column-resize drag handles (placed on right border of each inner column)
  const colHandleStyle = {
    position: 'absolute',
    top: 0,
    right: -3,
    bottom: 0,
    width: 6,
    cursor: 'col-resize',
    zIndex: 10,
    background: 'transparent',
    touchAction: 'none',
  };

  // Shared style for row-resize drag handles (placed on bottom border of each non-last row)
  const rowHandleStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -3,
    height: 6,
    cursor: 'row-resize',
    zIndex: 10,
    background: 'transparent',
    touchAction: 'none',
  };

  const numDataRows = education.length;

  return (
    <table
      ref={tableRef}
      className="w-full border-collapse border border-black text-black text-center text-[15px]"
      style={{ tableLayout: colWidths ? 'fixed' : 'auto', width: '100%' }}
    >
      {/* Column width hints when fixed layout is active */}
      {colWidths && (
        <colgroup>
          {columns.map((_, i) => (
            <col key={i} style={{ width: `${colWidths[i]}%` }} />
          ))}
        </colgroup>
      )}

      <thead>
        {/* ── Header row ── */}
        <tr>
          {columns.map((col, colIdx) => {
            const cellHeight = rowHeights?.[0];
            return (
              <th
                key={colIdx}
                className="border border-black p-2 font-bold"
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  ...(cellHeight ? { height: cellHeight, minHeight: cellHeight } : { height: '0.5in' }),
                }}
              >
                {col}
                {/* Column resize handle on the right edge of inner columns */}
                {unlocked && colIdx < 3 && (
                  <div
                    style={colHandleStyle}
                    onMouseDown={(e) => handleColDragStart(e, colIdx)}
                    onTouchStart={(e) => handleColDragStart(e, colIdx)}
                    data-resize-type="col"
                    data-col-idx={colIdx}
                    aria-hidden="true"
                  />
                )}
                {/* Row resize handle on the bottom edge of the header row (not after last row) */}
                {unlocked && numDataRows > 0 && (
                  <div
                    style={rowHandleStyle}
                    onMouseDown={(e) => handleRowDragStart(e, 0)}
                    onTouchStart={(e) => handleRowDragStart(e, 0)}
                    data-resize-type="row"
                    data-row-idx={0}
                    aria-hidden="true"
                  />
                )}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {education.map((item, rowIdx) => {
          const cellHeight = rowHeights?.[rowIdx + 1];
          const isLastRow = rowIdx === numDataRows - 1;
          return (
            <tr key={item.id}>
              {dataKeys.map((key, colIdx) => (
                <td
                  key={colIdx}
                  className="border border-black p-2"
                  style={{
                    position: 'relative',
                    textAlign: 'center',
                    ...(cellHeight ? { height: cellHeight, minHeight: cellHeight } : { height: '0.5in' }),
                  }}
                >
                  {item[key]}
                  {/* Column resize handle */}
                  {unlocked && colIdx < 3 && (
                    <div
                      style={colHandleStyle}
                      onMouseDown={(e) => handleColDragStart(e, colIdx)}
                      onTouchStart={(e) => handleColDragStart(e, colIdx)}
                      data-resize-type="col"
                      data-col-idx={colIdx}
                      aria-hidden="true"
                    />
                  )}
                  {/* Row resize handle on the bottom edge of each non-last row */}
                  {unlocked && !isLastRow && (
                    <div
                      style={rowHandleStyle}
                      onMouseDown={(e) => handleRowDragStart(e, rowIdx + 1)}
                      onTouchStart={(e) => handleRowDragStart(e, rowIdx + 1)}
                      data-resize-type="row"
                      data-row-idx={rowIdx + 1}
                      aria-hidden="true"
                    />
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export const OnCampusResumeLayout = forwardRef(({ resumeData, onTableChange, dateItalics = true }, ref) => {
  const { personalDetails, education, internships, achievements, projects, skills, skillsDescription, positions, activities } = resumeData;

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

  const renderParsedDescription = (description) => {
    if (!description) return null;
    const lines = description.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    const hasMarker = lines.some(line => /^[-*•]\s+/.test(line));

    if (hasMarker) {
      const elements = [];
      let currentList = [];

      lines.forEach((line, idx) => {
        const match = line.match(/^[-*•]\s+(.*)/);
        if (match) {
          currentList.push(match[1]);
        } else {
          if (currentList.length > 0) {
            elements.push(
              <ul key={`list-${idx}`} className="custom-circle-list mt-1 text-justify">
                {currentList.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-justify" dangerouslySetInnerHTML={{ __html: formatBold(item) }} />
                ))}
              </ul>
            );
            currentList = [];
          }
          elements.push(
            <div key={`p-${idx}`} className="text-justify" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
          );
        }
      });

      if (currentList.length > 0) {
        elements.push(
          <ul key="list-final" className="custom-circle-list mt-1 text-justify">
            {currentList.map((item, itemIdx) => (
              <li key={itemIdx} className="text-justify" dangerouslySetInnerHTML={{ __html: formatBold(item) }} />
            ))}
          </ul>
        );
      }

      return <div className="space-y-1">{elements}</div>;
    } else {
      return <div className="text-justify" dangerouslySetInnerHTML={{ __html: formatBold(description) }} />;
    }
  };

  const renderParsedActivities = (description) => {
    if (!description) return null;
    const lines = description.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    const hasMarker = lines.some(line => /^[-*•]\s+/.test(line));

    if (hasMarker) {
      const elements = [];
      let currentList = [];

      lines.forEach((line, idx) => {
        const match = line.match(/^[-*•]\s+(.*)/);
        if (match) {
          currentList.push(match[1]);
        } else {
          if (currentList.length > 0) {
            elements.push(
              <ul key={`list-${idx}`} className="custom-bullet-list technical-skills-list mt-1">
                {currentList.map((item, itemIdx) => (
                  <li key={itemIdx} dangerouslySetInnerHTML={{ __html: formatBold(item) }} />
                ))}
              </ul>
            );
            currentList = [];
          }
          elements.push(
            <div key={`p-${idx}`} className="text-justify" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
          );
        }
      });

      if (currentList.length > 0) {
        elements.push(
          <ul key="list-final" className="custom-bullet-list technical-skills-list mt-1">
            {currentList.map((item, itemIdx) => (
              <li key={itemIdx} dangerouslySetInnerHTML={{ __html: formatBold(item) }} />
            ))}
          </ul>
        );
      }

      return <div className="space-y-1">{elements}</div>;
    } else {
      return <div className="text-justify" dangerouslySetInnerHTML={{ __html: formatBold(description) }} />;
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white shadow-lg pt-14 px-10 pb-2 leading-relaxed w-[210mm] text-black"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      <header className="flex items-start justify-between pb-4 text-[15px]">
        <div className="flex items-center flex-grow min-w-0">
          {personalDetails.logo && <img src={personalDetails.logo} alt="Institute Logo" className="h-36 w-36 mr-6 flex-shrink-0" />}
          <div className="flex-grow min-w-0">
            <h1 className="font-bold tracking-wide break-words text-[25px] leading-none mb-1">
              <span 
                className="preview-clickable-header" 
                data-section-title="Personal Details"
                onClick={() => window.dispatchEvent(new CustomEvent('open-resume-section', { detail: { title: 'Personal Details' } }))}
              >
                {personalDetails.name}
              </span>
            </h1>
            <p>{personalDetails.degree}</p>
            <div className="leading-normal">
              <p>Gender: {personalDetails.gender}</p>
              <p>Date of Birth: {personalDetails.dob}</p>
              <p>E-mail: {personalDetails.email}</p>
              <p>Contact : {personalDetails.contact}</p>
            </div>
          </div>
        </div>
        {personalDetails.photo && <img src={personalDetails.photo} alt="Profile" className="h-[140px] w-[130px] object-cover border border-black ml-4 flex-shrink-0" />}
      </header>
      <hr className="border-t-[2px] border-black mt-4 mb-2 -mx-10" />
      <main className="text-[15px] pt-2" style={{ lineHeight: resumeData.lineSpacing || 1.625 }}>
        {education && education.length > 0 && (
          <ResumeSection title="Educational Qualification">
            <div className="mt-3.5">
              <ResizableEduTable
                education={education}
                unlocked={!!onTableChange}
                colWidths={resumeData.educationColWidths}
                rowHeights={resumeData.educationRowHeights}
                onTableChange={onTableChange || (() => { })}
              />
            </div>
          </ResumeSection>
        )}
        {achievements && achievements.length > 0 && (
          <ResumeSection title="Academic Achievements" splittable={true}>
            <ul className="custom-bullet-list technical-skills-list space-y-1 text-[15px]">
              {achievements.map(item => <li key={item.id} dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />)}
            </ul>
          </ResumeSection>
        )}
        {internships && internships.length > 0 && (
          <ResumeSection title="Internship Experience" splittable={true}>
            <ul className="custom-bullet-list technical-skills-list space-y-4 text-[15px]">
              {internships.map(item => (
                <li key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[15px]">{item.title}</h3>
                    <p className="flex-shrink-0 ml-4 text-right">
                      {item.from && item.to ? (
                        <span style={{ fontStyle: dateItalics ? "italic" : "normal" }}>{item.from} – {item.to}</span>
                      ) : (item.from || item.to) ? (
                        <span style={{ fontStyle: dateItalics ? "italic" : "normal" }}>{item.from || item.to}</span>
                      ) : null}
                    </p>
                  </div>
                  {renderParsedDescription(item.description)}
                </li>
              ))}
            </ul>
          </ResumeSection>
        )}
        {projects && projects.length > 0 && (
          <ResumeSection title="Projects" splittable={true}>
            <ul className="custom-bullet-list technical-skills-list space-y-4 text-[15px]">
              {projects.map(item => (
                <li key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[15px]">{item.name}</h3>
                    <p className="flex-shrink-0 ml-4 text-right">
                      {item.from && item.to ? (
                        <span style={{ fontStyle: dateItalics ? "italic" : "normal" }}>{item.from} – {item.to}</span>
                      ) : (item.from || item.to) ? (
                        <span style={{ fontStyle: dateItalics ? "italic" : "normal" }}>{item.from || item.to}</span>
                      ) : null}
                    </p>
                  </div>
                  {renderParsedDescription(item.description)}
                </li>
              ))}
            </ul>
          </ResumeSection>
        )}
        {((skills && skills.length > 0) || (skillsDescription && skillsDescription.trim() !== "")) && (
          <ResumeSection title="Technical Skills and Certifications" splittable={false}>
            {skillsDescription && skillsDescription.trim() !== "" && (
              <div 
                className="text-[15px] mb-3 text-justify" 
                dangerouslySetInnerHTML={{ __html: formatBold(skillsDescription) }} 
              />
            )}
            {skills && skills.length > 0 && (
              <ul className="custom-bullet-list technical-skills-list">
                {skills.map(item => (
                  <li key={item.id} className="flex items-start">
                    <span className="w-56 flex-shrink-0 break-words">{item.category}</span>
                    <span className="mx-2 flex-shrink-0">:</span>
                    <span className="flex-1 break-words text-justify" dangerouslySetInnerHTML={{ __html: formatBold(item.skills) }} />
                  </li>
                ))}
              </ul>
            )}
          </ResumeSection>
        )}
        {positions && positions.length > 0 && (
          <ResumeSection title="Positions of Responsibility" splittable={true}>
            <ul className="custom-bullet-list technical-skills-list space-y-4 text-[15px]">
              {positions.map(item => (
                <li key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[15px]">{item.title}</h3>
                    <p className="flex-shrink-0 ml-4 text-right">
                      {item.from && item.to ? (
                        <span style={{ fontStyle: dateItalics ? "italic" : "normal" }}>{item.from} – {item.to}</span>
                      ) : (item.from || item.to) ? (
                        <span style={{ fontStyle: dateItalics ? "italic" : "normal" }}>{item.from || item.to}</span>
                      ) : null}
                    </p>
                  </div>
                  {renderParsedDescription(item.description)}
                </li>
              ))}
            </ul>
          </ResumeSection>
        )}
        {activities && activities.some(item => item.description.trim() !== "") && (
          <ResumeSection title="Extracurricular Activities" splittable={true}>
            <div className="space-y-3">
              {activities.map(item => item.description.trim() !== "" && (
                <div key={item.id}>
                  <h3 className="font-bold text-[15px]">{item.title}</h3>
                  {renderParsedActivities(item.description)}
                </div>
              ))}
            </div>
          </ResumeSection>
        )}
      </main>
      <footer
        className="flex items-center justify-center text-center w-full"
        style={{ fontFamily: "Cambria, serif", fontSize: "10pt", color: "#808080", lineHeight: "1.2", paddingBottom: "9px" }}
      >
        <div style={{ borderTop: "1px solid #2596be", width: "100px", margin: "0 15px" }} />
        <div className="px-1">
          <p style={{ margin: 0 }}>Department of Training and Placement, NIT Trichy 620015</p>
          <p style={{ margin: 0 }}>Telephone : +91-431-2501081 &nbsp; e-mail: tp@nitt.edu, tnp.nitt@gmail.com</p>
        </div>
        <div style={{ borderTop: "1px solid #2596be", width: "100px", margin: "0 15px" }} />
      </footer>
    </div>
  );
});

OnCampusResumeLayout.displayName = "OnCampusResumeLayout";

export const OnCampusPreview = forwardRef(({ resumeData, onPhotoUploadClick, onLogoUploadClick, setResumeData, unlockTableBorders, dateItalics }, ref) => {
  const rawLayoutRef = useRef(null);
  const pagesContainerRef = useRef(null);
  const [pagesHtml, setPagesHtml] = useState([]);
  const [headerHtml, setHeaderHtml] = useState("");
  const [footerHtml, setFooterHtml] = useState("");
  const [footerHeight, setFooterHeight] = useState(0);

  const isMobileOrSmallScreen = typeof navigator !== "undefined" && (/Mobi|Android|iPhone|iPad|iPod|Windows Phone/.test(navigator.userAgent) || (typeof window !== "undefined" && window.innerWidth < 800));

  useImperativeHandle(ref, () => ({
    getHtmlForPdf: () => pagesContainerRef.current
  }));

  useEffect(() => {
    const container = pagesContainerRef.current;
    if (!container) return;

    const handleContainerClick = (e) => {
      const target = e.target;
      if (target && target.classList.contains('preview-clickable-header')) {
        const title = target.getAttribute('data-section-title');
        if (title) {
          window.dispatchEvent(new CustomEvent('open-resume-section', { detail: { title } }));
        }
      }
    };

    container.addEventListener('click', handleContainerClick);
    return () => {
      container.removeEventListener('click', handleContainerClick);
    };
  }, []);

  useEffect(() => {
    if (!unlockTableBorders) return;
    const container = pagesContainerRef.current;
    if (!container) return;

    const handleStart = (e) => {
      const handle = e.target;
      if (!handle || !(handle instanceof HTMLElement)) return;

      const resizeType = handle.getAttribute('data-resize-type');
      if (!resizeType) return;

      if (resizeType === 'col') {
        const colIdx = parseInt(handle.getAttribute('data-col-idx'), 10);
        if (!isNaN(colIdx)) {
          handleColDrag(e, colIdx, handle);
        }
      } else if (resizeType === 'row') {
        const rowIdx = parseInt(handle.getAttribute('data-row-idx'), 10);
        if (!isNaN(rowIdx)) {
          handleRowDrag(e, rowIdx, handle);
        }
      }
    };

    const handleColDrag = (startEvent, colIdx, handleEl) => {
      startEvent.preventDefault();
      startEvent.stopPropagation();

      const table = handleEl.closest('table');
      if (!table) return;
      const totalWidth = table.getBoundingClientRect().width;

      const currentColWidths = resumeData.educationColWidths;

      let startPcts;
      if (currentColWidths) {
        startPcts = [...currentColWidths];
      } else {
        const headerCells = Array.from(table.querySelectorAll('thead tr:not(.edu-rh-tr) th'));
        const pxWidths = headerCells.map(th => th.getBoundingClientRect().width);
        const total = pxWidths.reduce((a, b) => a + b, 0) || totalWidth;
        startPcts = pxWidths.map(w => (w / total) * 100);
      }

      const clientX = startEvent.touches ? startEvent.touches[0].clientX : startEvent.clientX;
      const dragColState = { colIdx, startX: clientX, startPcts, totalWidth };

      const onMove = (me) => {
        if (me.cancelable) me.preventDefault();
        const cx = me.touches ? me.touches[0].clientX : me.clientX;
        const dxPx = cx - dragColState.startX;
        const dxPct = (dxPx / dragColState.totalWidth) * 100;
        const minPct = (MIN_COL_PX / dragColState.totalWidth) * 100;
        const { startPcts: sp, colIdx: ci } = dragColState;
        const newPcts = [...sp];
        const sumLR = sp[ci] + sp[ci + 1];
        newPcts[ci] = Math.max(minPct, Math.min(sumLR - minPct, sp[ci] + dxPct));
        newPcts[ci + 1] = sumLR - newPcts[ci];

        setResumeData(prev => ({
          ...prev,
          educationColWidths: newPcts
        }));
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchend', onUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchend', onUp);
    };

    const handleRowDrag = (startEvent, rowIdx, handleEl) => {
      startEvent.preventDefault();
      startEvent.stopPropagation();

      const table = handleEl.closest('table');
      if (!table) return;

      const allRealTrs = Array.from(table.querySelectorAll('tr:not(.edu-rh-tr)'));
      const currentRowHeights = resumeData.educationRowHeights;

      let startHeights;
      if (currentRowHeights) {
        startHeights = [...currentRowHeights];
      } else {
        startHeights = allRealTrs.map(tr => tr.getBoundingClientRect().height);
      }

      const clientY = startEvent.touches ? startEvent.touches[0].clientY : startEvent.clientY;
      const dragRowState = { rowIdx, startY: clientY, startHeights };

      const onMove = (me) => {
        if (me.cancelable) me.preventDefault();
        const cy = me.touches ? me.touches[0].clientY : me.clientY;
        const dy = cy - dragRowState.startY;
        const { startHeights: sh, rowIdx: ri } = dragRowState;
        const newHeights = [...sh];
        newHeights[ri] = Math.max(MIN_ROW_PX, sh[ri] + dy);

        setResumeData(prev => ({
          ...prev,
          educationRowHeights: newHeights
        }));
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchend', onUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchend', onUp);
    };

    container.addEventListener('mousedown', handleStart);
    container.addEventListener('touchstart', handleStart, { passive: false });

    return () => {
      container.removeEventListener('mousedown', handleStart);
      container.removeEventListener('touchstart', handleStart);
    };
  }, [resumeData.educationColWidths, resumeData.educationRowHeights, unlockTableBorders, setResumeData]);

  useLayoutEffect(() => {
    let active = true;

    const calculateLayout = () => {
      if (!active) return;
      if (!rawLayoutRef.current) return;
      
      const scratchDiv = document.createElement("div");
      // Copy exact classes and style properties from the layout wrapper
      scratchDiv.className = rawLayoutRef.current.className;
      scratchDiv.setAttribute("style", rawLayoutRef.current.getAttribute("style") || "");
      
      // Measure off-screen
      scratchDiv.style.position = "absolute";
      scratchDiv.style.left = "-9999px";
      scratchDiv.style.top = "0";
      scratchDiv.style.width = "794px";
      scratchDiv.style.transform = "none";
      scratchDiv.style.zoom = "1";
      scratchDiv.style.pointerEvents = "none";
      scratchDiv.style.visibility = "hidden";
      scratchDiv.innerHTML = rawLayoutRef.current.innerHTML;
      document.body.appendChild(scratchDiv);

      const headerEl = scratchDiv.querySelector("header");
      const footerEl = scratchDiv.querySelector("footer");
      const mainEl = scratchDiv.querySelector("main");
      const hrEl = scratchDiv.querySelector("header + hr");

      if (!headerEl || !footerEl || !mainEl || !hrEl) {
        if (scratchDiv.parentElement) scratchDiv.parentElement.removeChild(scratchDiv);
        return;
      }

      setHeaderHtml(headerEl.outerHTML);
      setFooterHtml(footerEl.outerHTML);

      const getOuterHeight = (el) => {
        if (!el) return 0;
        const style = window.getComputedStyle(el);
        return el.getBoundingClientRect().height + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
      };

      const sections = Array.from(mainEl.children);
      const mainStyle = window.getComputedStyle(mainEl);
      const paddingTop = parseInt(mainStyle.paddingTop, 10) || 0;
      const bottomGap = isMobileOrSmallScreen ? 12 : 5;

      const headerAndHrHeight = getOuterHeight(headerEl) + getOuterHeight(hrEl);
      const rawFooterVal = isMobileOrSmallScreen ? (footerEl.getBoundingClientRect().height || 0) : getOuterHeight(footerEl);

      if (isMobileOrSmallScreen) {
        setFooterHeight(rawFooterVal);
      }

      // Read parent padding values dynamically from rawLayoutRef
      const layoutStyle = window.getComputedStyle(rawLayoutRef.current);
      const containerPaddingTop = parseInt(layoutStyle.paddingTop, 10) || 56;
      const containerPaddingBottom = parseInt(layoutStyle.paddingBottom, 10) || 8;
      // subsequent pages have pt-10 (40px)
      const subsequentPagePaddingTop = Math.max(0, containerPaddingTop - 16); 

      const firstPageMaxHeight = PAGE_HEIGHT_PX - (containerPaddingTop + paddingTop) - headerAndHrHeight - rawFooterVal - bottomGap;
      const subsequentPageMaxHeight = PAGE_HEIGHT_PX - subsequentPagePaddingTop - rawFooterVal - bottomGap;

      const pages = [];
      let currentPageHtml = "";
      let currentPageHeight = 0;
      let isFirstPage = true;

      for (const section of sections) {
        let pageMaxHeight = isFirstPage ? firstPageMaxHeight : subsequentPageMaxHeight;
        const sectionHeight = getOuterHeight(section);

        if (currentPageHeight + sectionHeight <= pageMaxHeight) {
          currentPageHtml += section.outerHTML;
          currentPageHeight += sectionHeight;
        } else {
          const isSplittable = section.getAttribute("data-splittable") === "true";
          if (isSplittable) {
            const listEl = section.querySelector("ul, div.space-y-3");
            if (listEl) {
              const listItems = Array.from(listEl.children);
              let firstPartHtml = "";
              let secondPartHtml = "";
              let fitsInCurrentPage = true;

              const headerDiv = section.querySelector(".section-header-flex");
              const sectionHeaderHeight = headerDiv ? getOuterHeight(headerDiv) : 35;
              let accumulatedHeight = currentPageHeight + sectionHeaderHeight;
              let secondPartHeight = 0;

              for (const item of listItems) {
                const itemHeight = getOuterHeight(item);
                if (fitsInCurrentPage && accumulatedHeight + itemHeight <= pageMaxHeight) {
                  firstPartHtml += item.outerHTML;
                  accumulatedHeight += itemHeight;
                } else {
                  fitsInCurrentPage = false;
                  secondPartHtml += item.outerHTML;
                  secondPartHeight += itemHeight;
                }
              }

              if (firstPartHtml !== "") {
                const cloneFirst = section.cloneNode(true);
                const cloneFirstList = cloneFirst.querySelector("ul, div.space-y-3");
                if (cloneFirstList) cloneFirstList.innerHTML = firstPartHtml;
                currentPageHtml += cloneFirst.outerHTML;
              }

              if (secondPartHtml !== "") {
                pages.push(currentPageHtml);
                isFirstPage = false;
                pageMaxHeight = subsequentPageMaxHeight;

                const cloneSecond = section.cloneNode(true);
                const cloneSecondList = cloneSecond.querySelector("ul, div.space-y-3");
                if (cloneSecondList) cloneSecondList.innerHTML = secondPartHtml;

                const sectionStyle = window.getComputedStyle(section);
                const sectionMarginBottom = parseInt(sectionStyle.marginBottom, 10) || 0;

                currentPageHtml = cloneSecond.outerHTML;
                currentPageHeight = sectionHeaderHeight + secondPartHeight + sectionMarginBottom;
              } else {
                pages.push(currentPageHtml);
                isFirstPage = false;
                currentPageHtml = "";
                currentPageHeight = 0;
              }
            } else {
              if (currentPageHtml !== "") {
                pages.push(currentPageHtml);
              }
              isFirstPage = false;
              currentPageHtml = section.outerHTML;
              currentPageHeight = sectionHeight;
            }
          } else {
            if (currentPageHtml !== "") {
              pages.push(currentPageHtml);
            }
            isFirstPage = false;
            currentPageHtml = section.outerHTML;
            currentPageHeight = sectionHeight;
          }
        }
      }

      if (currentPageHtml !== "") {
        pages.push(currentPageHtml);
      }

      setPagesHtml(pages);
      if (scratchDiv.parentElement) scratchDiv.parentElement.removeChild(scratchDiv);
    };

    calculateLayout();

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (active) calculateLayout();
      });
    }

    window.addEventListener("resize", calculateLayout);
    return () => {
      active = false;
      window.removeEventListener("resize", calculateLayout);
    };
  }, [resumeData, dateItalics, isMobileOrSmallScreen]);

  const UploadPromptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-75 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );

  return (
    <div ref={pagesContainerRef} className="flex flex-col items-center gap-8">
      {/* Hidden off-screen raw layout — used for pagination measurement only.
          When unlocked, also wires onTableChange to update resumeData. */}
      <div
        aria-hidden={true}
        style={{
          position: 'absolute',
          top: 0,
          left: -9999,
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        <OnCampusResumeLayout
          resumeData={resumeData}
          ref={rawLayoutRef}
          dateItalics={dateItalics}
          onTableChange={setResumeData && unlockTableBorders ? (colWidths, rowHeights) => {
            setResumeData(prev => ({ ...prev, educationColWidths: colWidths, educationRowHeights: rowHeights }));
          } : undefined}
        />
      </div>
      {/* Paginated pages — always rendered so page separation and upload prompts remain visible */}
      {pagesHtml.length > 0 ? (
        pagesHtml.map((pageContent, idx) => (
          <div key={idx} className="relative">
            <div className={`resume-page-container overflow-hidden bg-white shadow-lg px-10 pb-2 w-[210mm] h-[297mm] flex flex-col text-black leading-relaxed relative ${idx === 0 ? "pt-14" : "pt-10"}`}>
              {idx === 0 && (
                <Fragment>
                  <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
                  <hr className="border-t-[2px] border-black mt-4 mb-2 -mx-10" />
                </Fragment>
              )}
              <main
                className={`text-[15px] flex-grow ${idx === 0 ? "pt-2" : "pt-0"}`}
                style={{
                  lineHeight: resumeData.lineSpacing || 1.625,
                  ...(isMobileOrSmallScreen ? { paddingBottom: `${footerHeight + 8}px` } : {})
                }}
                dangerouslySetInnerHTML={{ __html: pageContent }}
              />
              <div
                className="absolute bottom-0 left-0 w-full bg-white z-10"
                dangerouslySetInnerHTML={{ __html: footerHtml }}
              />
            </div>
            {idx === 0 && (
              <Fragment>
                <button
                  onClick={onLogoUploadClick}
                  className={`absolute top-[56px] left-[40px] h-36 w-36 bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 ${isPlaceholderImage(resumeData.personalDetails.logo) ? "bg-opacity-50 opacity-100" : "bg-opacity-40 opacity-50 group-hover:opacity-100"
                    }`}
                  aria-label="Select new logo"
                >
                  <UploadPromptIcon />
                </button>
                <button
                  onClick={onPhotoUploadClick}
                  className={`absolute top-[56px] right-[40px] h-[140px] w-[130px] bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 ${isPlaceholderImage(resumeData.personalDetails.photo) ? "bg-opacity-50 opacity-100" : "bg-opacity-40 opacity-50 group-hover:opacity-100"
                    }`}
                  aria-label="Select new photo"
                >
                  <UploadPromptIcon />
                </button>
              </Fragment>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white shadow-lg w-[210mm] h-[297mm] flex items-center justify-center">
          <p className="text-center p-8 text-gray-500">Generating preview...</p>
        </div>
      )}
    </div>
  );
});

OnCampusPreview.displayName = "OnCampusPreview";
