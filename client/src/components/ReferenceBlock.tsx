import React from 'react';

const ReferenceBlock: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white/20 rounded-2xl shadow-lg backdrop-blur-md border border-white/30">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Reference</h3>
      <div className="text-gray-700 text-sm text-center px-4">
        This is the Reference block. You can put any reference content here.
      </div>
    </div>
  );
};

export default ReferenceBlock; 