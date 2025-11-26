import React from 'react';
import { X, Mail, Calendar, Tag, Phone, MapPin, Cake } from 'lucide-react';

const UserDetailModal = ({ user, onClose, token }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">User ID</label>
                <p className="text-gray-900 font-medium">{user.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Username</label>
                <p className="text-gray-900 font-medium">{user.username}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">First Name</label>
                <p className="text-gray-900 font-medium">{user.first_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Last Name</label>
                <p className="text-gray-900 font-medium">{user.last_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <Tag size={16} />
                  Role
                </label>
                <p className="text-gray-900 font-medium">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Verified</label>
                <p className={`font-medium ${user.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                  {user.is_verified ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar size={16} />
                  Registered
                </label>
                <p className="text-gray-900 font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Last Login</label>
                <p className="text-gray-900 font-medium">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(user.contact || user.home_address || user.birthday) && (
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-6">
                {user.contact && (
                  <div>
                    <label className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={16} />
                      Contact
                    </label>
                    <p className="text-gray-900 font-medium">{user.contact}</p>
                  </div>
                )}
                {user.home_address && (
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin size={16} />
                      Address
                    </label>
                    <p className="text-gray-900 font-medium">{user.home_address}</p>
                  </div>
                )}
                {user.birthday && (
                  <div>
                    <label className="text-sm text-gray-600 flex items-center gap-2">
                      <Cake size={16} />
                      Birthday
                    </label>
                    <p className="text-gray-900 font-medium">{new Date(user.birthday).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {user.xp && (
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Points</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">Total XP</label>
                  <p className="text-gray-900 font-medium">{user.xp.total_xp}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Current Level</label>
                  <p className="text-gray-900 font-medium">Level {user.xp.current_level}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
