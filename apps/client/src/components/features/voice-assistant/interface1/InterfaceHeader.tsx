import React from 'react';
export const InterfaceHeader: React.FC = () => {
  return (
    <div
      className="w-full flex justify-center items-center py-8"
      data-testid="interface1-header"
    >
      <h1
        className="hidden sm:block text-3xl md:text-4xl font-bold text-white text-center"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        Speak in Multiple Languages
      </h1>
    </div>
  );
};
