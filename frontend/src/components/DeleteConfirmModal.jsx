import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({
  agent,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !agent) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(agent.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-cream-200 shadow-creamy-xl w-full max-w-md overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cream-500 hover:text-cream-950 hover:bg-cream-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-cream-950 font-display">
            Delete Delivery Agent?
          </h3>
          <p className="text-xs text-cream-600 mt-1 leading-relaxed">
            Are you sure you want to delete <strong className="text-cream-900">{agent.full_name}</strong> (
            <code className="text-[11px] font-mono bg-cream-100 px-1.5 py-0.5 rounded text-cream-800">
              {agent.id}
            </code>
            )? This action will remove the record from PostgreSQL and invalidate all cached queries.
          </p>
        </div>

        <div className="pt-3 border-t border-cream-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="creamy-btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
