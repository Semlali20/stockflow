import Swal from 'sweetalert2';

const isDark = () =>
  document.documentElement.getAttribute('data-theme') === 'dark' ||
  document.documentElement.classList.contains('dark');

const bg  = () => isDark() ? '#18181b' : '#ffffff';
const txt = () => isDark() ? '#f4f4f5' : '#18181b';

const applyPopupStyles = (popup: HTMLElement, background: string) => {
  popup.style.borderRadius = '20px';
  popup.style.padding = '0';
  popup.style.overflow = 'hidden';
  popup.style.boxShadow = '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)';
  popup.style.background = background;
};

function buildHtml(
  accentColor: string,
  gradientFrom: string,
  gradientTo: string,
  iconSvg: string,
  title: string,
  text: string,
) {
  const dark = isDark();
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;">
      <div style="height:4px;background:linear-gradient(90deg,${gradientFrom},${gradientTo});"></div>
      <div style="padding:32px 28px 28px;">
        <div style="width:56px;height:56px;border-radius:16px;background:${accentColor}18;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;">
          ${iconSvg}
        </div>
        <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:${dark ? '#f4f4f5' : '#111827'};text-align:center;letter-spacing:-0.3px;">${title}</h2>
        <p style="margin:0;font-size:14px;color:${dark ? '#a1a1aa' : '#6b7280'};text-align:center;line-height:1.6;">${text}</p>
      </div>
    </div>
  `;
}

const cancelBtnStyle = (dark: boolean) => `
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: 1.5px solid ${dark ? '#3f3f46' : '#e5e7eb'};
  background: ${dark ? '#27272a' : '#f9fafb'};
  color: ${dark ? '#a1a1aa' : '#374151'};
  cursor: pointer;
  transition: all 0.15s;
`;

const confirmBtnStyle = (color: string) => `
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  background: ${color};
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 14px ${color}55;
  transition: all 0.15s;
`;

/** Green confirm — positive actions (complete, approve, start) */
export const confirmAction = async (title: string, text: string, confirmText = 'Confirm'): Promise<boolean> => {
  const dark = isDark();
  const result = await Swal.fire({
    html: buildHtml(
      '#10b981',
      '#10b981',
      '#059669',
      `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      title,
      text,
    ),
    background: bg(),
    color: txt(),
    showCancelButton: true,
    reverseButtons: true,
    focusConfirm: false,
    buttonsStyling: false,
    customClass: {
      popup: '',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
      actions: 'swal-actions',
    },
    didOpen: (popup) => {
      applyPopupStyles(popup, bg());
      const confirmBtn = popup.querySelector('.swal-confirm-btn') as HTMLElement;
      const cancelBtn  = popup.querySelector('.swal-cancel-btn')  as HTMLElement;
      if (confirmBtn) confirmBtn.style.cssText = confirmBtnStyle('linear-gradient(135deg,#10b981,#059669)');
      if (cancelBtn)  cancelBtn.style.cssText  = cancelBtnStyle(dark);
      const actions = popup.querySelector('.swal-actions') as HTMLElement;
      if (actions) {
        actions.style.cssText = 'display:flex;gap:10px;justify-content:center;padding:0 28px 28px;margin:0;';
      }
    },
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};

/** Red confirm — destructive actions (delete) */
export const confirmDelete = async (title: string, text: string, confirmText = 'Delete'): Promise<boolean> => {
  const dark = isDark();
  const result = await Swal.fire({
    html: buildHtml(
      '#ef4444',
      '#ef4444',
      '#dc2626',
      `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
      title,
      text,
    ),
    background: bg(),
    color: txt(),
    showCancelButton: true,
    reverseButtons: true,
    focusConfirm: false,
    buttonsStyling: false,
    customClass: {
      popup: '',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
      actions: 'swal-actions',
    },
    didOpen: (popup) => {
      applyPopupStyles(popup, bg());
      const confirmBtn = popup.querySelector('.swal-confirm-btn') as HTMLElement;
      const cancelBtn  = popup.querySelector('.swal-cancel-btn')  as HTMLElement;
      if (confirmBtn) confirmBtn.style.cssText = confirmBtnStyle('linear-gradient(135deg,#ef4444,#dc2626)');
      if (cancelBtn)  cancelBtn.style.cssText  = cancelBtnStyle(dark);
      const actions = popup.querySelector('.swal-actions') as HTMLElement;
      if (actions) actions.style.cssText = 'display:flex;gap:10px;justify-content:center;padding:0 28px 28px;margin:0;';
    },
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};

/** Amber confirm — caution actions (reset, update status, revoke) */
export const confirmWarning = async (title: string, text: string, confirmText = 'Proceed'): Promise<boolean> => {
  const dark = isDark();
  const result = await Swal.fire({
    html: buildHtml(
      '#f59e0b',
      '#f59e0b',
      '#d97706',
      `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      title,
      text,
    ),
    background: bg(),
    color: txt(),
    showCancelButton: true,
    reverseButtons: true,
    focusConfirm: false,
    buttonsStyling: false,
    customClass: {
      popup: '',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
      actions: 'swal-actions',
    },
    didOpen: (popup) => {
      applyPopupStyles(popup, bg());
      const confirmBtn = popup.querySelector('.swal-confirm-btn') as HTMLElement;
      const cancelBtn  = popup.querySelector('.swal-cancel-btn')  as HTMLElement;
      if (confirmBtn) confirmBtn.style.cssText = confirmBtnStyle('linear-gradient(135deg,#f59e0b,#d97706)');
      if (cancelBtn)  cancelBtn.style.cssText  = cancelBtnStyle(dark);
      const actions = popup.querySelector('.swal-actions') as HTMLElement;
      if (actions) actions.style.cssText = 'display:flex;gap:10px;justify-content:center;padding:0 28px 28px;margin:0;';
    },
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};

/** Textarea input dialog — replaces window.prompt for cancel/hold reasons */
export const promptInput = async (
  title: string,
  inputLabel: string,
  placeholder = ''
): Promise<string | null> => {
  const dark = isDark();
  const result = await Swal.fire({
    html: buildHtml(
      '#6366f1',
      '#6366f1',
      '#4f46e5',
      `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
      title,
      inputLabel,
    ),
    background: bg(),
    color: txt(),
    input: 'textarea',
    inputPlaceholder: placeholder,
    inputAttributes: {
      rows: '3',
      style: `resize:none;border-radius:10px;padding:10px 12px;font-size:14px;border:1.5px solid ${dark ? '#3f3f46' : '#e5e7eb'};background:${dark ? '#27272a' : '#f9fafb'};color:${dark ? '#f4f4f5' : '#111827'};width:100%;box-sizing:border-box;outline:none;`,
    },
    showCancelButton: true,
    reverseButtons: true,
    focusConfirm: false,
    buttonsStyling: false,
    customClass: {
      popup: '',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
      actions: 'swal-actions',
      input: 'swal-textarea',
    },
    didOpen: (popup) => {
      applyPopupStyles(popup, bg());
      const confirmBtn = popup.querySelector('.swal-confirm-btn') as HTMLElement;
      const cancelBtn  = popup.querySelector('.swal-cancel-btn')  as HTMLElement;
      if (confirmBtn) confirmBtn.style.cssText = confirmBtnStyle('linear-gradient(135deg,#6366f1,#4f46e5)');
      if (cancelBtn)  cancelBtn.style.cssText  = cancelBtnStyle(dark);
      const actions = popup.querySelector('.swal-actions') as HTMLElement;
      if (actions) actions.style.cssText = 'display:flex;gap:10px;justify-content:center;padding:0 28px 28px;margin:0;';
      const inputEl = popup.querySelector('.swal-textarea') as HTMLElement;
      if (inputEl) inputEl.style.cssText = `resize:none;border-radius:10px;padding:10px 12px;font-size:14px;border:1.5px solid ${dark ? '#3f3f46' : '#e5e7eb'};background:${dark ? '#27272a' : '#f9fafb'};color:${dark ? '#f4f4f5' : '#111827'};`;
    },
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value?.trim()) return 'Please enter a reason to continue.';
    },
  });
  return result.isConfirmed ? (result.value as string) : null;
};
