
import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-medical-500 text-white p-2 rounded-md mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M8 19h8a4 4 0 0 0 4-4 7 7 0 0 0-7-7h-1a5 5 0 0 0-9 3v1c0 2.5 2 5 5 5h2"></path>
                <line x1="8" y1="19" x2="8" y2="12"></line>
                <line x1="12" y1="19" x2="12" y2="12"></line>
                <line x1="16" y1="19" x2="16" y2="12"></line>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">TruDetect</h1>
              <p className="text-sm text-gray-500">Resume Analyzer</p>
            </div>
          </div>
          {/* <div className="text-center sm:text-right">
            <p className="text-sm text-gray-600">
              Powered by OpenAI Vision
            </p>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
