import React from "react";

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" // 'danger' | 'primary' | 'warning'
}) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: "bg-red-600 hover:bg-red-700",
      icon: "⚠️",
      text: "text-red-600"
    },
    primary: {
      bg: "bg-indigo-600 hover:bg-indigo-700",
      icon: "ℹ️",
      text: "text-indigo-600"
    },
    warning: {
      bg: "bg-amber-500 hover:bg-amber-600",
      icon: "⚠️",
      text: "text-amber-600"
    }
  };

  const theme = colors[type] || colors.primary;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onCancel} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${type === 'danger' ? 'bg-red-100' : type === 'warning' ? 'bg-amber-100' : 'bg-indigo-100'}`}>
              {theme.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all shadow-sm ${theme.bg}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
