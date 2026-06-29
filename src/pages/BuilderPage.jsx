import { useState, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Printer, Download, Copy, Check } from 'lucide-react';
import { usePWA } from '../components/PWAContext';
import {
  OnCampusEditor,
  OnCampusPreview
} from '../components/templates/OnCampus';
import {
  ModernCreativeEditor,
  ModernCreativePreview
} from '../components/templates/ModernCreative';
import {
  CorporateMinimalEditor,
  CorporateMinimalPreview
} from '../components/templates/CorporateMinimal';
import {
  DEFAULT_RESUME_DATA,
  MODERN_CREATIVE_SAMPLE_DATA,
  CORPORATE_MINIMAL_SAMPLE_DATA,
  THEME_COLOR_OPTIONS
} from '../utils/constants';
import {
  isPlaceholderImage
} from '../utils/helpers';

const ActionButton = ({
  onClick,
  className,
  label,
  children,
  disabled,
  showTooltipOnHover = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef(null);
  const hasLongPressed = useRef(false);

  const startPress = (e) => {
    if (e.type === 'mousedown' && e.button !== 0) return;

    hasLongPressed.current = false;
    timerRef.current = setTimeout(() => {
      hasLongPressed.current = true;
      setShowTooltip(true);
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (err) {
          void err;
        }
      }
    }, 500);
  };

  const endPress = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setShowTooltip(false);

    if (hasLongPressed.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseEnter = () => {
    if (showTooltipOnHover) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleClick = (e) => {
    if (hasLongPressed.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchMove={endPress}
      onTouchCancel={endPress}
      disabled={disabled}
      className={`relative ${className}`}
    >
      {children}
      {showTooltip && (
        <span className="absolute top-full left-1/2 mt-2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded shadow-lg whitespace-nowrap z-50 animate-fade-in font-medium pointer-events-none">
          {label}
        </span>
      )}
    </button>
  );
};

const BuilderPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTemplate = searchParams.get('template') || 'on-campus';
  const { isInstallable, installApp } = usePWA();

  const [resumeData, setResumeData] = useState(() => {
    const uploaded = sessionStorage.getItem('uploadedResumeData');
    if (uploaded) {
      try {
        const data = JSON.parse(uploaded);
        sessionStorage.removeItem('uploadedResumeData');
        return data;
      } catch (e) {
        console.error("Failed to parse uploaded resume data:", e);
      }
    }
    return selectedTemplate === "modern-creative"
      ? MODERN_CREATIVE_SAMPLE_DATA
      : selectedTemplate === "corporate-minimal"
        ? CORPORATE_MINIMAL_SAMPLE_DATA
        : DEFAULT_RESUME_DATA;
  });

  const [isEditorExpanded, setIsEditorExpanded] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomInputVal, setZoomInputVal] = useState("100%");
  const [isDownloading, setIsDownloading] = useState(false);
  const [themeColor, setThemeColor] = useState(() => {
    const uploadedColor = sessionStorage.getItem('uploadedThemeColor');
    if (uploadedColor) {
      sessionStorage.removeItem('uploadedThemeColor');
      return uploadedColor;
    }
    return "#2274a5";
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLogoSelectionModal, setShowLogoSelectionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const resumePreviewRef = useRef(null);
  const photoFileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  const [unlockTableBorders, setUnlockTableBorders] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const isInitialMount = useRef(true);
  const [copiedEmDash, setCopiedEmDash] = useState(false);
  const emDashTimeoutRef = useRef(null);

  const handleCopyEmDash = () => {
    navigator.clipboard.writeText("–");
    setCopiedEmDash(true);
    if (emDashTimeoutRef.current) {
      clearTimeout(emDashTimeoutRef.current);
    }
    emDashTimeoutRef.current = setTimeout(() => {
      setCopiedEmDash(false);
    }, 1500);
  };

  // Check draft existence and query param
  useEffect(() => {
    const draft = localStorage.getItem(`suyavivaram_resume_${selectedTemplate}`);
    if (draft) {
      setDraftAvailable(true);
    }

    const draftParam = searchParams.get('draft');
    const uploaded = sessionStorage.getItem('uploadedResumeData');

    if (draftParam === 'true' && draft) {
      try {
        const parsed = JSON.parse(draft);
        isInitialMount.current = true;
        setResumeData(parsed);
        const savedTheme = localStorage.getItem(`suyavivaram_theme_${selectedTemplate}`);
        if (savedTheme) {
          setThemeColor(savedTheme);
        }
        setDraftAvailable(false);
        setSaveStatus("Saved");
        setHasChanges(false);
      } catch (e) {
        console.error("Failed to parse draft from localStorage:", e);
      }
    } else if (draft && !uploaded) {
      setShowRestoreModal(true);
    }
  }, [selectedTemplate, searchParams]);

  // Set initial mount to false after 200ms to ignore initial react-state render updates
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Track user edits/changes
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    if (!showRestoreModal) {
      setHasChanges(true);
    }
  }, [resumeData, themeColor, showRestoreModal]);

  // Autosave
  useEffect(() => {
    if (!hasChanges || showRestoreModal) {
      return;
    }

    setSaveStatus("Saving...");

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`suyavivaram_resume_${selectedTemplate}`, JSON.stringify(resumeData));
        localStorage.setItem(`suyavivaram_theme_${selectedTemplate}`, themeColor);
        localStorage.setItem(`suyavivaram_timestamp_${selectedTemplate}`, Date.now().toString());
        setSaveStatus("Saved");
        setDraftAvailable(false);
      } catch (e) {
        console.error("Failed to autosave draft:", e);
        setSaveStatus("Error saving");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [resumeData, themeColor, selectedTemplate, hasChanges, showRestoreModal]);

  const loadDraftData = () => {
    const draft = localStorage.getItem(`suyavivaram_resume_${selectedTemplate}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        isInitialMount.current = true;
        setResumeData(parsed);
        const savedTheme = localStorage.getItem(`suyavivaram_theme_${selectedTemplate}`);
        if (savedTheme) {
          setThemeColor(savedTheme);
        }
        setDraftAvailable(false);
        setSaveStatus("Saved");
        setHasChanges(false);
        setTimeout(() => {
          isInitialMount.current = false;
        }, 100);
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  };

  const handleRestoreDraft = () => {
    loadDraftData();
    setShowRestoreModal(false);
  };

  const handleStartFresh = () => {
    setShowRestoreModal(false);
    setHasChanges(false);
    setSaveStatus("Saved");
  };


  // beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to discard them?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    setZoomInputVal(`${Math.round(zoomLevel * 100)}%`);
  }, [zoomLevel]);

  useEffect(() => {
    const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod|Windows Phone/.test(navigator.userAgent) || typeof window !== "undefined" && window.innerWidth < 800;
    if (isMobile) {
      setZoomLevel(0.45);
      setZoomInputVal("45%");
    }
  }, []);

  const triggerPhotoUpload = () => photoFileInputRef.current?.click();
  const openLogoSelection = () => setShowLogoSelectionModal(true);
  const selectDefaultLogo = () => {
    const defaultLogo = "assets/images/NITTLogo.png";
    setResumeData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, logo: defaultLogo }
    }));
    setShowLogoSelectionModal(false);
  };
  const triggerLogoUpload = () => {
    logoFileInputRef.current?.click();
    setShowLogoSelectionModal(false);
  };

  const validateUploads = () => {
    const isPhotoPlaceholder = isPlaceholderImage(resumeData.personalDetails.photo);
    const isLogoPlaceholder = isPlaceholderImage(resumeData.personalDetails.logo);
    if (selectedTemplate === "on-campus") {
      if (isPhotoPlaceholder && isLogoPlaceholder) return "Please upload a profile photo and the institute logo before downloading.";
      if (isPhotoPlaceholder) return "Please upload a profile photo before downloading.";
      if (isLogoPlaceholder) return "Please upload the institute logo before downloading.";
    } else if (selectedTemplate === "modern-creative" && isPhotoPlaceholder) {
      return "Please upload a profile photo before downloading.";
    }
    return null;
  };

  const showBannerError = (msg) => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    setErrorMessage(msg);
    errorTimeoutRef.current = window.setTimeout(() => {
      setErrorMessage(null);
      errorTimeoutRef.current = null;
    }, 6000);
  };

  const handleDownloadPdf = async () => {
    const validationError = validateUploads();
    if (validationError) {
      showBannerError(validationError);
      return;
    }

    const previewEl = resumePreviewRef.current?.getHtmlForPdf();
    if (!previewEl) {
      console.error("Resume container not found for PDF generation.");
      showBannerError("Could not generate PDF. Please try again.");
      return;
    }

    const pages = previewEl.querySelectorAll(".resume-page-container");
    if (pages.length === 0) {
      console.error("No pages found to download.");
      showBannerError("There is no content to download as a PDF.");
      return;
    }

    setIsDownloading(true);

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showBannerError("Popup blocked. Please allow popups for this website to download your resume.");
        setIsDownloading(false);
        return;
      }

      const doc = printWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${resumeData.personalDetails.name || 'Resume'}</title>
        </head>
        <body>
          <div id="print-container"></div>
        </body>
        </html>
      `);
      doc.close();

      // Clone and copy all stylesheets, font links, and custom style elements
      document.querySelectorAll('link, style').forEach(el => {
        if (el.id === 'pdf-generation-fonts') return;
        doc.head.appendChild(el.cloneNode(true));
      });

      // Insert custom print layout and spacing CSS
      const printStyle = doc.createElement('style');
      printStyle.innerHTML = `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #print-container {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .resume-page-container {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            position: relative !important;
          }
          /* Hide helper button overlays, upload triggers, and interactive components */
          button,
          [aria-label^="Upload"],
          [class*="upload-btn"],
          .no-print {
            display: none !important;
          }
        }
        @media screen {
          body {
            background: #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem 0;
            margin: 0;
            font-family: "Lato", sans-serif;
          }
          .resume-page-container {
            background: white;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            box-sizing: border-box;
            position: relative;
          }
          button,
          [aria-label^="Upload"],
          [class*="upload-btn"],
          .no-print {
            display: none !important;
          }
        }
      `;
      doc.head.appendChild(printStyle);

      const container = doc.getElementById('print-container');
      pages.forEach(page => {
        const clone = page.cloneNode(true);
        // Clean up buttons and upload prompts in the cloned pages
        clone.querySelectorAll('button, [aria-label^="Upload"], .no-print').forEach(el => el.remove());
        container.appendChild(clone);
      });

      // Wait for all images (photos, logos) in the document to load
      const images = Array.from(doc.querySelectorAll('img'));
      const imagePromises = images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      // Wait for fonts and images to be fully loaded
      Promise.all([...imagePromises, printWindow.document.fonts.ready]).then(() => {
        setTimeout(() => {
          printWindow.focus();

          // Automatically close the window after printing is accepted or cancelled
          printWindow.onafterprint = () => {
            printWindow.close();
          };

          printWindow.print();
        }, 300);
      }).catch(err => {
        console.error("Error waiting for print assets to load:", err);
        printWindow.focus();
        printWindow.print();
      });

    } catch (e) {
      console.error("PDF Print Window initialization failed", e);
      showBannerError(e.message || "An error occurred while preparing the PDF print layout.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveConfig = () => {
    try {
      const clonedResumeData = JSON.parse(JSON.stringify(resumeData));
      const images = {
        photo: "",
        logo: ""
      };

      if (clonedResumeData.personalDetails) {
        // Extract base64 photo if present
        if (clonedResumeData.personalDetails.photo && clonedResumeData.personalDetails.photo.startsWith("data:image")) {
          images.photo = clonedResumeData.personalDetails.photo;
          clonedResumeData.personalDetails.photo = "uploaded-photo";
        }

        // Extract base64 logo / handle NITT logo
        if (clonedResumeData.personalDetails.logo) {
          if (clonedResumeData.personalDetails.logo === "assets/images/NITTLogo.png") {
            images.logo = "NITTLogo";
            clonedResumeData.personalDetails.logo = "NITTLogo";
          } else if (clonedResumeData.personalDetails.logo.startsWith("data:image")) {
            images.logo = clonedResumeData.personalDetails.logo;
            clonedResumeData.personalDetails.logo = "uploaded-logo";
          }
        }
      }

      const config = {
        version: "1.0",
        layout: selectedTemplate,
        themeColor: themeColor,
        resumeData: clonedResumeData,
        images: images
      };

      const jsonStr = JSON.stringify(config, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const userName = resumeData.personalDetails?.name
        ? resumeData.personalDetails.name.trim().toLowerCase().replace(/\s+/g, "_")
        : "resume";
      link.href = url;
      link.download = `${userName}_suyavivaram_config.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save configuration:", error);
      showBannerError("Failed to save configuration.");
    }
  };

  const handleZoomInputChange = (e) => setZoomInputVal(e.target.value);

  const applyZoomInput = () => {
    let val = parseFloat(zoomInputVal.replace(/%/g, "").trim());
    if (isNaN(val)) {
      setZoomInputVal(`${Math.round(zoomLevel * 100)}%`);
    } else {
      val = Math.max(20, Math.min(500, val));
      setZoomLevel(val / 100);
    }
  };

  const handleZoomInputBlur = () => applyZoomInput();

  const handleZoomInputKeyDown = (e) => {
    if (e.key === "Enter") {
      applyZoomInput();
      e.target.blur();
    } else if (e.key === "Escape") {
      setZoomInputVal(`${Math.round(zoomLevel * 100)}%`);
      e.target.blur();
    }
  };

  const handleBack = () => {
    navigate('/templates');
  };

  return (
    <>
      <div className="flex h-screen bg-gray-200 overflow-hidden w-full">
        {/* --- Sidebar layout container --- */}
        <aside className={`transition-all duration-300 ease-in-out bg-white shadow-lg flex-shrink-0 relative ${isEditorExpanded ? "w-full md:w-[500px]" : "w-0"} overflow-hidden`}>
          <div className="h-screen overflow-y-auto flex flex-col">
            {/* Status bar */}
            <div className="sticky top-0 z-20 bg-slate-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${saveStatus === "Saving..." ? "bg-amber animate-ping" : saveStatus === "Saved" ? "bg-emerald" : "bg-paprika"}`} />
                <span className="text-xs font-semibold text-dimgrey">
                  {saveStatus === "Saving..." ? "Saving draft..." : saveStatus === "Saved" ? "Draft saved to local storage" : "Changes not saved"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyEmDash}
                  className={`text-xs px-2.5 py-1 rounded font-semibold border transition-all flex items-center gap-1 active:scale-95 ${copiedEmDash
                    ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  title="Copy em dash (–) to clipboard"
                >
                  {copiedEmDash ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                  )}
                  <span>{copiedEmDash ? "Copied!" : "Copy"}: –</span>
                </button>
                {draftAvailable && (
                  <button
                    onClick={loadDraftData}
                    className="text-xs bg-cerulean text-white px-2.5 py-1 rounded font-bold hover:bg-cerulean/90 shadow-sm transition-all"
                  >
                    Continue Editing
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1">
              {selectedTemplate === "on-campus" ? (
                <OnCampusEditor
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  photoFileInputRef={photoFileInputRef}
                  logoFileInputRef={logoFileInputRef}
                  unlockTableBorders={unlockTableBorders}
                  setUnlockTableBorders={setUnlockTableBorders}
                />
              ) : selectedTemplate === "modern-creative" ? (
                <ModernCreativeEditor
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  photoFileInputRef={photoFileInputRef}
                  logoFileInputRef={logoFileInputRef}
                />
              ) : (
                <CorporateMinimalEditor
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                />
              )}
            </div>
          </div>
        </aside>

        {/* --- Main live preview pane --- */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col items-center">
          {/* --- Action toolbar --- */}
          <div className="mb-4 bg-white p-1 sm:p-2 rounded-md sm:rounded-lg shadow-md flex items-center gap-2 sticky top-0 z-10">
            <ActionButton
              onClick={handleBack}
              label="Back"
              className="h-7 sm:h-8 px-2 sm:px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1.5 mr-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back</span>
            </ActionButton>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <ActionButton
              onClick={() => setZoomLevel(z => Math.max(0.2, z - 0.1))}
              label="Zoom Out"
              showTooltipOnHover={true}
              className="h-7 sm:h-8 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold flex items-center justify-center"
            >
              -
            </ActionButton>
            <ActionButton
              onClick={() => setZoomLevel(1)}
              label="Reset Zoom"
              showTooltipOnHover={true}
              className="h-7 sm:h-8 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm flex items-center justify-center"
            >
              Reset
            </ActionButton>
            <ActionButton
              onClick={() => setZoomLevel(z => z + 0.1)}
              label="Zoom In"
              showTooltipOnHover={true}
              className="h-7 sm:h-8 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold flex items-center justify-center"
            >
              +
            </ActionButton>
            <input
              type="text" value={zoomInputVal} onChange={handleZoomInputChange} onBlur={handleZoomInputBlur} onKeyDown={handleZoomInputKeyDown}
              className="h-7 sm:h-8 text-sm text-gray-600 w-14 sm:w-16 text-center bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Zoom percentage"
            />

            {/* --- Color picker for Modern layout only --- */}
            {selectedTemplate === "modern-creative" && (
              <div className="relative ml-2">
                <ActionButton
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm focus:outline-none ring-1 ring-gray-300 transition-transform hover:scale-105"
                  style={{ backgroundColor: themeColor }}
                  label="Change Theme Color"
                  showTooltipOnHover={true}
                />
                {showColorPicker && (
                  <Fragment>
                    <div className="fixed inset-0 z-10" onClick={() => setShowColorPicker(false)} />
                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white p-3 rounded-xl shadow-xl border border-gray-100 flex gap-2 z-20 animate-fade-in">
                      {THEME_COLOR_OPTIONS.map(opt => (
                        <button
                          key={opt.name}
                          onClick={() => { setThemeColor(opt.hex); setShowColorPicker(false); }}
                          className="w-8 h-8 rounded-full hover:scale-110 transition-transform ring-1 ring-gray-200 border-2 border-white shadow-sm"
                          style={{ backgroundColor: opt.hex }} title={opt.name}
                        />
                      ))}
                    </div>
                  </Fragment>
                )}
              </div>
            )}

            {/* --- Install App Button --- */}
            {isInstallable && (
              <ActionButton
                onClick={installApp}
                label="Install as an App"
                className="h-7 sm:h-8 px-2 sm:px-3 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm flex items-center justify-center gap-1.5 ml-2 transition-colors animate-pulse"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Install</span>
              </ActionButton>
            )}

            {/* --- Save Configuration Button --- */}
            <ActionButton
              onClick={handleSaveConfig}
              label="Save Config"
              className="h-7 sm:h-8 px-2 sm:px-3 bg-slate-700 hover:bg-slate-800 text-white rounded text-sm flex items-center justify-center gap-1.5 ml-2 transition-colors"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Save Config</span>
            </ActionButton>

            {/* --- PDF Generation Button --- */}
            <ActionButton
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              label={isDownloading ? "Generating..." : "Save as PDF"}
              className={`h-7 sm:h-8 px-2 sm:px-3 text-white rounded text-sm flex items-center justify-center gap-1.5 ml-2 transition-colors ${isDownloading ? "bg-green-400 cursor-wait" : "bg-green-500 hover:bg-green-600"
                }`}
            >
              {isDownloading ? (
                <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              <span className="hidden sm:inline">{isDownloading ? "Generating..." : "PDF"}</span>
            </ActionButton>
          </div>

          {/* --- Scalable Preview Container --- */}
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top" }}
            className="transition-transform duration-200"
          >
            {selectedTemplate === "on-campus" ? (
              <OnCampusPreview
                ref={resumePreviewRef}
                resumeData={resumeData}
                onPhotoUploadClick={triggerPhotoUpload}
                onLogoUploadClick={openLogoSelection}
                unlockTableBorders={unlockTableBorders}
                setResumeData={setResumeData}
              />
            ) : selectedTemplate === "modern-creative" ? (
              <ModernCreativePreview
                ref={resumePreviewRef}
                resumeData={resumeData}
                themeColor={themeColor}
                onPhotoUploadClick={triggerPhotoUpload}
                isDownloading={isDownloading}
              />
            ) : (
              <CorporateMinimalPreview
                ref={resumePreviewRef}
                resumeData={resumeData}
              />
            )}
          </div>
        </main>

        {/* --- Drawer Toggle Buttons --- */}
        {!isEditorExpanded && (
          <button
            onClick={() => setIsEditorExpanded(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 text-white rounded-r-lg px-2 py-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
            aria-label="Show Editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {isEditorExpanded && (
          <button
            onClick={() => setIsEditorExpanded(false)}
            className="fixed top-1/2 -translate-y-1/2 z-30 bg-blue-600 text-white rounded-l-lg px-2 py-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out left-full md:left-[500px] -translate-x-full"
            aria-label="Hide Editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* --- Error message banner --- */}
        {errorMessage && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

      </div>

      {/* --- Logo Upload / Select Choice Dialog --- */}
      {showLogoSelectionModal && createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Select Institute Logo</h3>
            <div className="space-y-3">
              <button
                onClick={selectDefaultLogo}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors border border-blue-200"
              >
                NITT Logo
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
              </div>
              <button
                onClick={triggerLogoUpload}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors border border-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Upload Logo
              </button>
            </div>
            <button onClick={() => setShowLogoSelectionModal(false)} className="mt-6 w-full text-center text-gray-400 hover:text-gray-600 text-sm font-medium">Cancel</button>
          </div>
        </div>,
        document.body
      )}

      {/* --- Restore Draft Modal --- */}
      {showRestoreModal && createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cerulean/10 text-cerulean rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Restore Autosaved Draft?</h3>
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              We found a previously saved draft for the <strong className="text-slate-800">{selectedTemplate === 'on-campus' ? 'OnCampus' : selectedTemplate === 'modern-creative' ? 'Modern Creative' : 'Corporate Minimal'}</strong> layout. Would you like to restore it and continue editing, or start fresh with default sample data?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleRestoreDraft}
                className="flex-1 px-4 py-3 bg-cerulean hover:bg-cerulean/90 text-white rounded-lg font-bold text-sm shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                Restore Draft
              </button>
              <button
                onClick={handleStartFresh}
                className="flex-1 px-4 py-3 bg-dimgrey hover:bg-dimgrey/90 text-white rounded-lg font-bold text-sm shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default BuilderPage;
