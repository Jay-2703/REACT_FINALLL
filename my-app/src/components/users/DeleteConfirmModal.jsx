import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ user, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-600 mb-4">
                You are about to delete the user <strong>{user?.username}</strong> ({user?.email}).
              </p>
              <p className="text-gray-600 text-sm">
                This action will soft-delete the user (data will be preserved but the user won't appear in the system).
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
