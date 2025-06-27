import React from 'react';
import logoImage from '../../assets/images/pop.jpg';
const UserProfile = () => {
  return (
    <div className="p-5 flex items-center justify-center">
      {/* Image pop.jpg */}
      <img 
        src={logoImage}
        alt="" 
        className="rounded-full w-30 h-30 object-cover"
      />
    </div>
  );
};

export default UserProfile;