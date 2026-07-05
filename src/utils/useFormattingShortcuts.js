import { useRef, useLayoutEffect } from 'react';

/**
 * Parses all matching pairs of open and close tags.
 * Uses a stack-based parser to correctly find open/close pairs.
 */
function findTagPairs(val, tagOpen, tagClose) {
  const pairs = [];
  const stack = [];
  let pos = 0;
  
  while (pos < val.length) {
    if (val.substring(pos, pos + tagOpen.length) === tagOpen) {
      stack.push(pos);
      pos += tagOpen.length;
    } else if (val.substring(pos, pos + tagClose.length) === tagClose) {
      if (stack.length > 0) {
        const openIndex = stack.pop();
        pairs.push({ openIndex, closeIndex: pos });
      }
      pos += tagClose.length;
    } else {
      pos++;
    }
  }
  // Sort pairs by nesting level (innermost first)
  return pairs.sort((a, b) => b.openIndex - a.openIndex);
}

/**
 * Smarter toggle tag logic:
 * - If the selection is nested inside a matching tag pair, unwrap it.
 * - If the selection encompasses a matching tag pair, unwrap it.
 * - Otherwise, wrap the selection in the tags.
 */
function toggleTagSmarter(val, start, end, tagOpen, tagClose) {
  const pairs = findTagPairs(val, tagOpen, tagClose);
  
  // Find a pair that nestedly contains the selection
  let pairToUnwrap = pairs.find(p => start >= p.openIndex + tagOpen.length && end <= p.closeIndex);
  
  if (pairToUnwrap) {
    const before = val.substring(0, pairToUnwrap.openIndex);
    const middle = val.substring(pairToUnwrap.openIndex + tagOpen.length, pairToUnwrap.closeIndex);
    const after = val.substring(pairToUnwrap.closeIndex + tagClose.length);
    const newValue = before + middle + after;
    
    const newStart = start - tagOpen.length;
    const newEnd = end - tagOpen.length;
    
    return { newValue, newStart, newEnd };
  }
  
  // Find if the selection itself encompasses any pairs
  pairToUnwrap = pairs.find(p => start <= p.openIndex && end >= p.closeIndex + tagClose.length);
  if (pairToUnwrap) {
    const before = val.substring(0, pairToUnwrap.openIndex);
    const middle = val.substring(pairToUnwrap.openIndex + tagOpen.length, pairToUnwrap.closeIndex);
    const after = val.substring(pairToUnwrap.closeIndex + tagClose.length);
    const newValue = before + middle + after;
    
    const newStart = start;
    const newEnd = end - tagOpen.length - tagClose.length;
    
    return { newValue, newStart, newEnd };
  }
  
  // Case 3: Wrap the selection
  const selected = val.substring(start, end);
  const newValue = val.substring(0, start) + tagOpen + selected + tagClose + val.substring(end);
  return {
    newValue,
    newStart: start + tagOpen.length,
    newEnd: end + tagOpen.length
  };
}

/**
 * Finds all character ranges occupied by <date ... /> and <a> tags.
 * - For key 'k' (hyperlink) and 'd' (date), the entire range of any existing <a> tag is forbidden to prevent nesting.
 * - For other formatting tags (b, i, u, s), only the opening and closing HTML tags themselves are forbidden.
 */
function getForbiddenRanges(val, key) {
  const ranges = [];

  // Find date tags (entire tag is forbidden)
  const dateRegex = /<date\b[^>]*>/gi;
  let match;
  while ((match = dateRegex.exec(val)) !== null) {
    ranges.push({
      start: match.index,
      end: match.index + match[0].length
    });
  }

  // Find hyperlink tags
  const linkRegex = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = linkRegex.exec(val)) !== null) {
    const fullMatch = match[0];
    
    if (key === 'k' || key === 'd') {
      // For links and date tags, the entire link block is forbidden to prevent nesting
      ranges.push({
        start: match.index,
        end: match.index + fullMatch.length
      });
    } else {
      // For standard tags (b, i, u, s), only opening/closing tags are forbidden
      const openTagLength = fullMatch.indexOf('>') + 1;

      // Forbidden range: opening tag
      ranges.push({
        start: match.index,
        end: match.index + openTagLength
      });

      // Forbidden range: closing tag
      ranges.push({
        start: match.index + fullMatch.length - 4, // </a> is 4 chars
        end: match.index + fullMatch.length
      });
    }
  }

  return ranges;
}

/**
 * Promise-based custom modal for Date formatting.
 */
function showCustomDatePrompt(defaultFrom, defaultTo) {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.className = "rounded-2xl border-0 p-0 shadow-2xl outline-none bg-transparent backdrop:bg-slate-900/50 backdrop:backdrop-blur-[2px] transition-all duration-300";
    
    dialog.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-100 p-5 w-[340px] shadow-2xl flex flex-col gap-4 font-sans text-slate-800 animate-modal-in">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            📅 Date Shorthand Helper
          </h3>
        </div>
        <div class="flex flex-col gap-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-0.5">From Date</label>
            <input type="text" id="date-from-input" class="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="e.g. May 2024" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-0.5">To Date</label>
            <input type="text" id="date-to-input" class="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="e.g. Present" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 mt-2">
          <button type="button" id="date-btn-cancel" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" id="date-btn-submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">Insert Tag</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const cleanup = (result) => {
      document.body.style.overflow = originalOverflow;
      dialog.close();
      dialog.remove();
      resolve(result);
    };

    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      cleanup(null);
    });

    const fromInput = dialog.querySelector('#date-from-input');
    const toInput = dialog.querySelector('#date-to-input');
    const cancelBtn = dialog.querySelector('#date-btn-cancel');
    const submitBtn = dialog.querySelector('#date-btn-submit');

    fromInput.value = defaultFrom;
    toInput.value = defaultTo;

    setTimeout(() => {
      if (!defaultFrom) {
        fromInput.focus();
        fromInput.select();
      } else if (!defaultTo) {
        toInput.focus();
        toInput.select();
      } else {
        fromInput.focus();
        fromInput.select();
      }
    }, 50);

    const handleSubmit = () => {
      cleanup({ from: fromInput.value.trim(), to: toInput.value.trim() });
    };

    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', () => cleanup(null));

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    fromInput.addEventListener('keydown', handleKeyDown);
    toInput.addEventListener('keydown', handleKeyDown);
  });
}

/**
 * Promise-based custom modal for Link formatting.
 */
function showCustomLinkPrompt(defaultUrl, defaultText) {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.className = "rounded-2xl border-0 p-0 shadow-2xl outline-none bg-transparent backdrop:bg-slate-900/50 backdrop:backdrop-blur-[2px] transition-all duration-300";
    
    dialog.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-100 p-5 w-[340px] shadow-2xl flex flex-col gap-4 font-sans text-slate-800 animate-modal-in">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            🔗 Hyperlink Helper
          </h3>
        </div>
        <div class="flex flex-col gap-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-0.5">URL</label>
            <input type="text" id="link-url-input" class="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="https://example.com" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-0.5">Link Text</label>
            <input type="text" id="link-text-input" class="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="Display Text" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 mt-2">
          <button type="button" id="link-btn-cancel" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" id="link-btn-submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">Insert Link</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const cleanup = (result) => {
      document.body.style.overflow = originalOverflow;
      dialog.close();
      dialog.remove();
      resolve(result);
    };

    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      cleanup(null);
    });

    const urlInput = dialog.querySelector('#link-url-input');
    const textInput = dialog.querySelector('#link-text-input');
    const cancelBtn = dialog.querySelector('#link-btn-cancel');
    const submitBtn = dialog.querySelector('#link-btn-submit');

    urlInput.value = defaultUrl;
    textInput.value = defaultText;

    setTimeout(() => {
      if (!defaultUrl || defaultUrl === "https://") {
        urlInput.focus();
        urlInput.setSelectionRange(defaultUrl.length, defaultUrl.length);
      } else {
        textInput.focus();
        textInput.select();
      }
    }, 50);

    const handleSubmit = () => {
      cleanup({ url: urlInput.value.trim(), text: textInput.value.trim() });
    };

    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', () => cleanup(null));

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    urlInput.addEventListener('keydown', handleKeyDown);
    textInput.addEventListener('keydown', handleKeyDown);
  });
}

export function useFormattingShortcuts(value, onChange) {
  const inputRef = useRef(null);
  const pendingSelectionRef = useRef(null);

  const handleKeyDown = async (e) => {
    // Check if Ctrl or Cmd key is pressed
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (!isCtrlOrCmd) return;

    const key = e.key.toLowerCase();
    const formattingKeys = ['b', 'i', 'u', 's', 'x', 'd', 'k'];
    if (!formattingKeys.includes(key)) return;

    const val = e.target.value || '';
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;

    // Do not allow tags if they overlap with forbidden ranges
    const forbiddenRanges = getForbiddenRanges(val, key);
    const hasOverlap = forbiddenRanges.some(r => start < r.end && end > r.start);
    if (hasOverlap) {
      e.preventDefault();
      return;
    }

    let tagOpen = '';
    let tagClose = '';

    if (key === 'b') {
      tagOpen = '<b>';
      tagClose = '</b>';
    } else if (key === 'i') {
      tagOpen = '<i>';
      tagClose = '</i>';
    } else if (key === 'u') {
      tagOpen = '<u>';
      tagClose = '</u>';
    } else if ((key === 's' || key === 'x') && e.shiftKey) {
      tagOpen = '<s>';
      tagClose = '</s>';
    } else if (key === 'd') {
      // Date shorthand tag helper
      e.preventDefault();
      const selected = val.substring(start, end);

      // Smart parsing
      let defaultFrom = "";
      let defaultTo = "";
      if (selected) {
        const parts = selected.split(/\s*[-–—to]\s*/i);
        if (parts.length >= 1) defaultFrom = parts[0].trim();
        if (parts.length >= 2) defaultTo = parts[1].trim();
      }

      const result = await showCustomDatePrompt(defaultFrom, defaultTo);
      if (!result) return; // Cancelled

      const { from, to } = result;
      const dateTag = `<date from="${from}" to="${to}" />`;

      const newValue = val.substring(0, start) + dateTag + val.substring(end);

      onChange({
        target: {
          name: e.target.name,
          value: newValue
        }
      });

      pendingSelectionRef.current = {
        start: start,
        end: start + dateTag.length
      };
      return;
    } else if (key === 'k') {
      // Hyperlink helper
      e.preventDefault();
      const selected = val.substring(start, end);

      const result = await showCustomLinkPrompt("https://", selected);
      if (!result) return; // Cancelled

      const { url, text } = result;
      const linkText = text || url;
      tagOpen = `<a href="${url}">`;
      tagClose = '</a>';
      
      const newValue = val.substring(0, start) + tagOpen + linkText + tagClose + val.substring(end);

      onChange({
        target: {
          name: e.target.name,
          value: newValue
        }
      });

      pendingSelectionRef.current = {
        start: start,
        end: start + tagOpen.length + linkText.length + tagClose.length
      };
      return;
    } else {
      return; // Not a matching shortcut
    }

    if (tagOpen) {
      e.preventDefault();
      const { newValue, newStart, newEnd } = toggleTagSmarter(val, start, end, tagOpen, tagClose);

      onChange({
        target: {
          name: e.target.name,
          value: newValue
        }
      });

      pendingSelectionRef.current = {
        start: newStart,
        end: newEnd
      };
    }
  };

  useLayoutEffect(() => {
    if (pendingSelectionRef.current && inputRef.current) {
      const { start, end } = pendingSelectionRef.current;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(start, end);
      pendingSelectionRef.current = null;
    }
  }, [value]);

  return { inputRef, handleKeyDown };
}
