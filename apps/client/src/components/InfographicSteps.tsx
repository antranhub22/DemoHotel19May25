import React from 'react';
import { t } from '@/i18n';
import { useAssistant } from '@/context';
import type { Language } from '@/types/interface1.types';

interface InfographicStepsProps {
  currentStep?: number;
  compact?: boolean;
  horizontal?: boolean;
  language?: Language;
}

export default function InfographicSteps({
  currentStep = 1,
  compact = false,
  horizontal = false,
  language: propLanguage,
}: InfographicStepsProps) {
  // Lấy language từ prop hoặc context
  const assistantContext = useAssistant();
  const { language: contextLanguage } = assistantContext || { language: 'en' };
  const language: Language = (propLanguage ||
    contextLanguage ||
    'en') as Language;

  const steps = [
    {
      icon: 'call',
      title: t('press_to_call', language),
      desc: t('press_to_call_desc', language),
    },
    {
      icon: 'check_circle',
      title: t('confirm_request', language),
      desc: t('confirm_request_desc', language),
    },
    {
      icon: 'mail',
      title: t('send_to_reception', language),
      desc: t('send_to_reception_desc', language),
    },
  ];

  if (horizontal) {
    return (
      <div className="flex flex-row items-center justify-center w-full gap-2 md:gap-6 py-1">
        {steps.map((step, idx) => (
          <React.Fragment key={step.title}>
            <div
              className={`flex flex-col items-center transition-all duration-300 ${
                idx + 1 === currentStep
                  ? 'opacity-100 scale-105'
                  : idx + 1 < currentStep
                    ? 'opacity-60'
                    : 'opacity-40'
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-full shadow-lg mb-0.5 transition-all duration-300 ${
                  idx + 1 === currentStep
                    ? 'bg-[#d4af37] text-blue-900 border-2 border-[#d4af37]'
                    : idx + 1 === 2 || idx + 1 === 3
                      ? 'bg-white/30 text-[#d4af37] border-2 border-[#d4af37]'
                      : 'bg-white/30 text-white border border-gray-200'
                }`}
                style={{
                  width: 22,
                  height: 22,
                  fontSize: 13,
                  boxShadow:
                    idx + 1 === 2 || idx + 1 === 3
                      ? '0 0 0 2px #d4af37'
                      : undefined,
                }}
              >
                <span className="material-icons">{step.icon}</span>
              </div>
              <div className="text-center">
                <div
                  className={`font-semibold font-poppins mb-0 text-[10px] ${idx + 1 === currentStep ? 'text-[#d4af37]' : 'text-[#d4af37]/70'} ${idx + 1 === 2 || idx + 1 === 3 ? 'font-extrabold text-base' : ''}`}
                >
                  {step.title}
                </div>
                <div
                  className={`font-light text-[8px] ${idx + 1 === 2 || idx + 1 === 3 ? 'text-base text-[#b48a19]' : 'text-[#d4af37]/80'} hidden md:block`}
                >
                  {step.desc}
                </div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="h-0.5 w-3 md:w-8 bg-gradient-to-r from-[#d4af37]/80 to-transparent mx-1 rounded-full" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
  // Dọc như cũ
  return (
    <div
      className={`w-full ${compact ? 'max-w-[160px] py-2 gap-3' : 'max-w-xs py-6 gap-6'} mx-auto flex flex-col items-center`}
    >
      {steps.map((step, idx) => (
        <div
          key={step.title}
          className={`flex flex-col items-center w-full transition-all duration-300 ${
            idx + 1 === currentStep
              ? 'opacity-100 scale-105'
              : idx + 1 < currentStep
                ? 'opacity-60'
                : 'opacity-40'
          }`}
        >
          <div
            className={`flex items-center justify-center rounded-full shadow-lg mb-2 transition-all duration-300 ${
              idx + 1 === currentStep
                ? 'bg-[#d4af37] text-blue-900 border-2 border-[#d4af37]'
                : idx + 1 === 2 || idx + 1 === 3
                  ? 'bg-white/30 text-[#d4af37] border-2 border-[#d4af37]'
                  : 'bg-white/30 text-white border border-gray-200'
            }`}
            style={{
              width: compact ? 32 : 48,
              height: compact ? 32 : 48,
              fontSize: compact ? 18 : 28,
              boxShadow:
                idx + 1 === 2 || idx + 1 === 3
                  ? '0 0 0 2px #d4af37'
                  : undefined,
            }}
          >
            <span className="material-icons">{step.icon}</span>
          </div>
          <div className="text-center">
            <div
              className={`font-semibold font-poppins mb-1 ${compact ? 'text-xs' : idx + 1 === 2 || idx + 1 === 3 ? 'text-lg' : 'text-base'} ${
                idx + 1 === currentStep ? 'text-[#d4af37]' : 'text-[#d4af37]/70'
              } ${idx + 1 === 2 || idx + 1 === 3 ? 'font-extrabold' : ''}`}
              style={
                idx + 1 === 2 || idx + 1 === 3 ? { letterSpacing: 0.5 } : {}
              }
            >
              {step.title}
            </div>
            <div
              className={`font-light ${compact ? 'text-[10px]' : idx + 1 === 2 || idx + 1 === 3 ? 'text-base' : 'text-sm'} ${idx + 1 === 2 || idx + 1 === 3 ? 'text-[#b48a19]' : 'text-[#d4af37]/80'}`}
            >
              {step.desc}
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`mx-auto my-1 rounded-full ${compact ? 'w-0.5 h-4' : 'w-1 h-8'} bg-gradient-to-b from-[#d4af37]/80 to-transparent`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
