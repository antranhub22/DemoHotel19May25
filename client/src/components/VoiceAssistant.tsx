import { useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import Interface1 from './Interface1';
import Interface2 from './Interface2';
import Interface3 from './Interface3';
import Interface3Vi from './Interface3Vi';
import Interface3Fr from './Interface3Fr';
import Interface4 from './Interface4';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Link } from 'wouter';
import { History, Info, X } from 'lucide-react';
import InfographicSteps from './InfographicSteps';
import { FaGlobeAsia } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { t } from '@/i18n';
import { Language, AssistantContextType } from '@/types';

const VoiceAssistant: React.FC = () => {
  const { currentInterface, language, setLanguage } = useAssistant();
  const [showInfographic, setShowInfographic] = useState(false);
  
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div className="relative h-screen overflow-hidden font-sans text-gray-800 bg-neutral-50" id="app">
      {/* Header Bar */}
      <header className="w-full bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-2">
          {/* Left: Logo */}
          <div className="w-16 flex-shrink-0 flex items-center justify-start ml-1 sm:ml-4 mr-2 sm:mr-6">
            <img src="/assets/references/images/minhon-logo.jpg" alt="Minhon Logo" className="h-10 sm:h-14 w-auto rounded-lg shadow-md bg-white/80 p-1" />
          </div>
          {/* Center: Empty space */}
          <div className="flex-1"></div>
          {/* Right: Call History, Refresh, Language, and Infographic */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm hover:bg-primary-darker transition-colors"
              title="Refresh"
            >
              <span className="material-icons text-sm sm:text-base mr-1">refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Language Dropdown */}
            <div className="flex items-center px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm">
              <FaGlobeAsia className="text-[#F9BF3B] text-sm sm:text-base mr-1.5" />
              <div className="relative">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as Language)}
                  className="appearance-none bg-transparent focus:outline-none transition-all duration-200 pr-6"
                  style={{
                    fontWeight: 600,
                    color: '#fff',
                    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <option value="en">🇬🇧 EN</option>
                  <option value="fr">🇫🇷 FR</option>
                  <option value="zh">🇨🇳 ZH</option>
                  <option value="ru">🇷🇺 RU</option>
                  <option value="ko">🇰🇷 KO</option>
                </select>
                <FiChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F9BF3B] pointer-events-none text-sm" />
              </div>
            </div>

            {/* Infographic Button */}
            <button
              onClick={() => setShowInfographic(true)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm hover:bg-primary-darker transition-colors"
              title="View Steps"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Steps</span>
            </button>

            {/* Call History */}
            <Link href="/call-history">
              <a className="flex items-center gap-1 px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm hover:bg-primary-darker transition-colors">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Call History</span>
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Infographic Popup */}
      {showInfographic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
            <button
              onClick={() => setShowInfographic(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mt-4">
              <InfographicSteps 
                horizontal={false}
                compact={false}
                currentStep={
                  currentInterface === 'interface3' ? 3 :
                  currentInterface === 'interface2' ? 2 : 1
                }
                language={language}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interface Layers Container */}
      <div className="relative w-full h-full" id="interfaceContainer">
        {currentInterface === 'interface1' && <Interface1 isActive={true} />}
        {currentInterface === 'interface2' && <Interface2 isActive={true} />}
        {currentInterface === 'interface3' && <Interface3 isActive={true} />}
        {currentInterface === 'interface3vi' && <Interface3Vi isActive={true} />}
        {currentInterface === 'interface3fr' && <Interface3Fr isActive={true} />}
        {currentInterface === 'interface4' && <Interface4 isActive={true} />}
      </div>
    </div>
  );
};

export default VoiceAssistant;
