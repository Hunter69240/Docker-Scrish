import React from 'react';

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
      <p className="text-white text-xl mt-4 font-semibold">Processing...</p>
    </div>
  );
}

export default LoadingSpinner;
