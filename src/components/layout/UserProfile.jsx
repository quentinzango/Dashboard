import React from 'react';

const UserProfile = () => {
  return (
    <div className="p-5 flex items-center justify-center">
      {/* Logo EnMKit seul */}
      <div className="flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-600 rounded-full w-20 h-20">
        <span className="text-white text-lg font-extrabold tracking-tight">
          EnMKit
        </span>
      </div>
    </div>
  );
};

export default UserProfile;
