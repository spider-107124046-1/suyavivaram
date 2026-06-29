import React, { useState, useRef, useLayoutEffect, useImperativeHandle, forwardRef, Fragment } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  OnCampusAccordion,
  OnCampusTextInput,
  OnCampusTextArea,
  ResumeSection
} from '../FormInputs';
import {
  PAGE_HEIGHT_PX,
  THEME_COLOR_STYLES
} from '../../utils/constants';
import {
  centerCrop,
  makeAspectCrop,
  generateUniqueId,
  isPlaceholderImage
} from '../../utils/helpers';

export const OnCampusEditor = ({ resumeData, setResumeData, photoFileInputRef, logoFileInputRef }) => {
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
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Profile Photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "photo")} ref={photoFileInputRef} className="hidden" />
          <button
            onClick={() => photoFileInputRef.current?.click()}
            className="w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-white text-gray-600 text-sm font-medium"
          >
            Upload Photo
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Institute Logo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} ref={logoFileInputRef} className="hidden" />
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
              Upload Logo
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
        {resumeData.education.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Education</h3>
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
        {resumeData.achievements.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Achievement</h3>
            <OnCampusTextArea label="Description" name="description" value={item.description} onChange={e => handleListItemChange("achievements", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold.</p>
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
        {resumeData.internships.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Internship</h3>
            <OnCampusTextInput label="Title" name="title" value={item.title} onChange={e => handleListItemChange("internships", item.id, e)} />
            <OnCampusTextInput label="Date" name="date" value={item.date} onChange={e => handleListItemChange("internships", item.id, e)} />
            <OnCampusTextArea label="Description" name="description" rows={5} value={item.description} onChange={e => handleListItemChange("internships", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold.</p>
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
          onClick={() => handleAddListItem("internships", { id: generateUniqueId(), title: "", date: "", description: "" })}
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
        {resumeData.projects.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Project</h3>
            <OnCampusTextInput label="Name" name="name" value={item.name} onChange={e => handleListItemChange("projects", item.id, e)} />
            <OnCampusTextInput label="Date" name="date" value={item.date} onChange={e => handleListItemChange("projects", item.id, e)} />
            <OnCampusTextArea label="Description" name="description" rows={5} value={item.description} onChange={e => handleListItemChange("projects", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold. Use a newline for bullet points.</p>
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
          onClick={() => handleAddListItem("projects", { id: generateUniqueId(), name: "", date: "", description: "" })}
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
        {resumeData.skills.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Skill</h3>
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
        {resumeData.positions.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Position</h3>
            <OnCampusTextInput label="Title" name="title" value={item.title} onChange={e => handleListItemChange("positions", item.id, e)} />
            <OnCampusTextInput label="Date" name="date" value={item.date} onChange={e => handleListItemChange("positions", item.id, e)} />
            <OnCampusTextArea label="Description" name="description" value={item.description} onChange={e => handleListItemChange("positions", item.id, e)} />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use <b>text</b> to make text bold.</p>
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
          onClick={() => handleAddListItem("positions", { id: generateUniqueId(), title: "", date: "", description: "" })}
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
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use a newline for bullet points. Use <b>text</b> to make text bold.</p>
          </div>
        ))}
      </OnCampusAccordion>

      {/* --- Crop Modal overlay --- */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Crop Your Image</h2>
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
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => { setShowCropModal(false); setCropSrc(""); }} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleCropSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Crop & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const OnCampusResumeLayout = forwardRef(({ resumeData }, ref) => {
  const { personalDetails, education, internships, achievements, projects, skills, positions, activities } = resumeData;
  const formatBold = text => text ? text.replace(/<b>/g, "<strong>").replace(/<\/b>/g, "</strong>").replace(/\n/g, "<br />") : "";

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
            <h1 className="font-bold tracking-wide break-words text-[25px] leading-none mb-1">{personalDetails.name}</h1>
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
      <main className="text-[15px] pt-2">
        {education && education.length > 0 && (
          <ResumeSection title="Educational Qualification">
            <div className="mt-3.5">
              <table className="w-full border-collapse border border-black text-black text-center text-[15px]">
                <thead>
                  <tr>
                    <th className="border border-black p-2 font-bold h-[0.5in]">Year</th>
                    <th className="border border-black p-2 font-bold h-[0.5in]">Degree/Examination</th>
                    <th className="border border-black p-2 font-bold h-[0.5in]">Institution/Board</th>
                    <th className="border border-black p-2 font-bold h-[0.5in]">CGPA/Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map(item => (
                    <tr key={item.id}>
                      <td className="border border-black p-2 h-[0.5in]">{item.year}</td>
                      <td className="border border-black p-2 h-[0.5in]">{item.degree}</td>
                      <td className="border border-black p-2 h-[0.5in]">{item.institution}</td>
                      <td className="border border-black p-2 h-[0.5in]">{item.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResumeSection>
        )}
        {achievements && achievements.length > 0 && (
          <ResumeSection title="Academic Achievements" splittable={true}>
            <ul className="custom-bullet-list technical-skills-list space-y-1 text-[15px]">
              {achievements.map(item => <li key={item.id} dangerouslySetInnerHTML={{ __html: item.description }} />)}
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
                    <p className="flex-shrink-0 ml-4 text-right">{item.date}</p>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
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
                    <p className="flex-shrink-0 ml-4 text-right">{item.date}</p>
                  </div>
                  {item.description.includes("\n") ? (
                    <ul className="custom-square-list mt-1">
                      {item.description.split("\n").filter(line => line.trim() !== "").map((line, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/<b>/g, "<strong>").replace(/<\/b>/g, "</strong>") }} />
                      ))}
                    </ul>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
                  )}
                </li>
              ))}
            </ul>
          </ResumeSection>
        )}
        {skills && skills.length > 0 && (
          <ResumeSection title="Technical Skills and Certifications" splittable={false}>
            <ul className="custom-bullet-list technical-skills-list">
              {skills.map(item => (
                <li key={item.id} className="flex items-start">
                  <span className="w-56 flex-shrink-0 break-words">{item.category}</span>
                  <span className="mx-2 flex-shrink-0">:</span>
                  <span className="flex-1 break-words">{item.skills}</span>
                </li>
              ))}
            </ul>
          </ResumeSection>
        )}
        {positions && positions.length > 0 && (
          <ResumeSection title="Positions of Responsibility" splittable={true}>
            <ul className="custom-bullet-list technical-skills-list space-y-4 text-[15px]">
              {positions.map(item => (
                <li key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[15px]">{item.title}</h3>
                    <p className="flex-shrink-0 ml-4 text-right">{item.date}</p>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: formatBold(item.description) }} />
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
                  <ul className="custom-bullet-list technical-skills-list mt-1">
                    {item.description.split("\n").map((line, idx) => line.trim() !== "" && (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: line }} />
                    ))}
                  </ul>
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
          <p style={{ margin: 0 }}>Telephone : +91-431-2501081 | e-mail: tp@nitt.edu,</p>
          <p style={{ margin: 0 }}>tnp.nitt@gmail.com</p>
        </div>
        <div style={{ borderTop: "1px solid #2596be", width: "100px", margin: "0 15px" }} />
      </footer>
    </div>
  );
});

OnCampusResumeLayout.displayName = "OnCampusResumeLayout";

export const OnCampusPreview = forwardRef(({ resumeData, onPhotoUploadClick, onLogoUploadClick }, ref) => {
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

  useLayoutEffect(() => {
    const calculateLayout = () => {
      if (!rawLayoutRef.current) return;
      const scratchDiv = document.createElement("div");
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
      const paddingTop = parseInt(mainStyle.paddingTop, 10);
      const bottomGap = isMobileOrSmallScreen ? 12 : 5;

      const headerAndHrHeight = getOuterHeight(headerEl) + getOuterHeight(hrEl);
      const rawFooterVal = isMobileOrSmallScreen ? (footerEl.getBoundingClientRect().height || 0) : getOuterHeight(footerEl);

      if (isMobileOrSmallScreen) {
        setFooterHeight(rawFooterVal);
      }

      const topPadding = 64;
      const bottomPadding = 48;
      const firstPageMaxHeight = PAGE_HEIGHT_PX - topPadding - headerAndHrHeight - rawFooterVal - paddingTop - bottomGap;
      const subsequentPageMaxHeight = PAGE_HEIGHT_PX - bottomPadding - rawFooterVal - bottomGap;

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

              for (const item of listItems) {
                const itemHeight = getOuterHeight(item);
                if (fitsInCurrentPage && accumulatedHeight + itemHeight <= pageMaxHeight) {
                  firstPartHtml += item.outerHTML;
                  accumulatedHeight += itemHeight;
                } else {
                  fitsInCurrentPage = false;
                  secondPartHtml += item.outerHTML;
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

                currentPageHtml = cloneSecond.outerHTML;
                currentPageHeight = sectionHeaderHeight + (accumulatedHeight - currentPageHeight - sectionHeaderHeight);
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
    window.addEventListener("resize", calculateLayout);
    return () => window.removeEventListener("resize", calculateLayout);
  }, [resumeData, isMobileOrSmallScreen]);

  const UploadPromptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-75 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );

  return (
    <div ref={pagesContainerRef} className="flex flex-col items-center gap-8">
      <div className="absolute top-0 left-[-9999px] opacity-0" aria-hidden="true">
        <OnCampusResumeLayout resumeData={resumeData} ref={rawLayoutRef} />
      </div>
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
                style={isMobileOrSmallScreen ? { paddingBottom: `${footerHeight + 8}px` } : undefined}
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
                  aria-label="Upload new logo"
                >
                  <UploadPromptIcon />
                </button>
                <button
                  onClick={onPhotoUploadClick}
                  className={`absolute top-[56px] right-[40px] h-[140px] w-[130px] bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 ${isPlaceholderImage(resumeData.personalDetails.photo) ? "bg-opacity-50 opacity-100" : "bg-opacity-40 opacity-50 group-hover:opacity-100"
                    }`}
                  aria-label="Upload new photo"
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
