import * as React from "react";
/// <reference types="vite/client" />

// Type declaration for import.meta

import { useAssistant } from "@/context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Language, ServiceItem } from "@/types/interface1.types";
import logger from "../../../../../../../packages/shared/utils/logger";
import {
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Settings,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { addMultiLanguageNotification } from "./MultiLanguageNotificationHelper";

interface VoicePrompt {
  service: string;
  language: Language;
  prompts: {
    greeting: string;
    instructions: string;
    examples: string[];
    fallback: string;
  };
}

interface VoiceCommandContextProps {
  selectedService?: ServiceItem | null;
  isCallActive?: boolean;
  onVoicePromptReady?: (prompt: VoicePrompt) => void;
  className?: string;
}

// Enhanced service-specific voice prompts with more languages
const VOICE_PROMPTS: Record<
  string,
  Record<Language, VoicePrompt["prompts"]>
> = {
  "Room Service": {
    en: {
      greeting:
        "Hello! I'm your room service assistant. What would you like to order?",
      instructions:
        "You can order food, drinks, or request dining setup in your room.",
      examples: [
        "I'd like to order breakfast for two",
        "Can I get a bottle of wine delivered?",
        "Please bring clean towels and toiletries",
      ],
      fallback:
        "I can help you with room service orders. Please tell me what you need.",
    },
    vi: {
      greeting:
        "Xin chào! Tôi là trợ lý dịch vụ phòng. Quý khách muốn gọi món gì?",
      instructions:
        "Quý khách có thể gọi món ăn, đồ uống, hoặc yêu cầu setup bàn ăn trong phòng.",
      examples: [
        "Tôi muốn gọi bữa sáng cho hai người",
        "Cho tôi một chai rượu vang được không?",
        "Làm ơn mang khăn sạch và đồ dùng vệ sinh",
      ],
      fallback:
        "Tôi có thể giúp quý khách đặt dịch vụ phòng. Xin hãy cho biết quý khách cần gì.",
    },
    fr: {
      greeting:
        "Bonjour! Je suis votre assistant de service en chambre. Que souhaitez-vous commander?",
      instructions:
        "Vous pouvez commander de la nourriture, des boissons, ou demander un service de table.",
      examples: [
        "J'aimerais commander le petit-déjeuner pour deux",
        "Puis-je avoir une bouteille de vin livrée?",
        "Veuillez apporter des serviettes propres et des articles de toilette",
      ],
      fallback:
        "Je peux vous aider avec les commandes de service en chambre. Dites-moi ce dont vous avez besoin.",
    },
    zh: {
      greeting: "您好！我是您的客房服务助手。您想要订什么？",
      instructions: "您可以订餐食、饮品，或要求在房间内布置餐桌。",
      examples: [
        "我想为两个人订早餐",
        "可以送一瓶红酒吗？",
        "请带一些干净的毛巾和洗漱用品",
      ],
      fallback: "我可以帮您订购客房服务。请告诉我您需要什么。",
    },
    ru: {
      greeting:
        "Здравствуйте! Я ваш помощник по обслуживанию номеров. Что бы вы хотели заказать?",
      instructions:
        "Вы можете заказать еду, напитки или попросить сервировку в номере.",
      examples: [
        "Я хотел бы заказать завтрак на двоих",
        "Можно доставить бутылку вина?",
        "Пожалуйста, принесите чистые полотенца и туалетные принадлежности",
      ],
      fallback:
        "Я могу помочь с заказом обслуживания номеров. Скажите, что вам нужно.",
    },
  },
  Restaurant: {
    en: {
      greeting:
        "Welcome to our restaurant service! How can I help you with dining?",
      instructions:
        "I can help with reservations, menu information, and special dietary requirements.",
      examples: [
        "I'd like to make a dinner reservation for tonight",
        "What's on today's special menu?",
        "Do you have vegetarian options?",
      ],
      fallback:
        "I can assist with restaurant reservations and dining information.",
    },
    vi: {
      greeting:
        "Chào mừng đến với dịch vụ nhà hàng! Tôi có thể giúp gì về việc ăn uống?",
      instructions:
        "Tôi có thể hỗ trợ đặt bàn, thông tin thực đơn và yêu cầu ăn kiêng đặc biệt.",
      examples: [
        "Tôi muốn đặt bàn tối nay",
        "Hôm nay có món đặc biệt gì?",
        "Có món chay không?",
      ],
      fallback: "Tôi có thể hỗ trợ đặt bàn nhà hàng và thông tin ẩm thực.",
    },
    fr: {
      greeting:
        "Bienvenue au service restaurant! Comment puis-je vous aider avec la restauration?",
      instructions:
        "Je peux vous aider avec les réservations, informations menu et exigences diététiques.",
      examples: [
        "J'aimerais faire une réservation pour ce soir",
        "Qu'y a-t-il au menu spécial aujourd'hui?",
        "Avez-vous des options végétariennes?",
      ],
      fallback:
        "Je peux vous aider avec les réservations de restaurant et les informations culinaires.",
    },
    zh: {
      greeting: "欢迎使用餐厅服务！我能为您的用餐提供什么帮助？",
      instructions: "我可以帮助您预订、了解菜单信息和特殊饮食要求。",
      examples: ["我想预订今晚的晚餐", "今天有什么特色菜？", "有素食选择吗？"],
      fallback: "我可以协助餐厅预订和用餐信息咨询。",
    },
    ru: {
      greeting:
        "Добро пожаловать в ресторанный сервис! Как я могу помочь с питанием?",
      instructions:
        "Могу помочь с бронированием, информацией о меню и особыми диетическими требованиями.",
      examples: [
        "Я хотел бы забронировать ужин на сегодня",
        "Что есть в сегодняшнем специальном меню?",
        "У вас есть вегетарианские блюда?",
      ],
      fallback:
        "Могу помочь с бронированием ресторана и информацией о питании.",
    },
  },
  Concierge: {
    en: {
      greeting:
        "Hello! I'm your concierge assistant. How can I help enhance your stay?",
      instructions:
        "I can assist with local recommendations, bookings, transportation, and general inquiries.",
      examples: [
        "Can you recommend good restaurants nearby?",
        "I need a taxi to the airport",
        "What tourist attractions are worth visiting?",
      ],
      fallback:
        "I'm here to help with any requests to make your stay more comfortable.",
    },
    vi: {
      greeting:
        "Xin chào! Tôi là trợ lý lễ tân. Tôi có thể giúp gì để chuyến lưu trú của quý khách tốt hơn?",
      instructions:
        "Tôi có thể hỗ trợ gợi ý địa phương, đặt chỗ, di chuyển và các câu hỏi chung.",
      examples: [
        "Bạn có thể gợi ý nhà hàng ngon gần đây không?",
        "Tôi cần taxi đến sân bay",
        "Có điểm du lịch nào đáng thăm?",
      ],
      fallback:
        "Tôi ở đây để giúp mọi yêu cầu làm cho chuyến lưu trú của quý khách thoải mái hơn.",
    },
    fr: {
      greeting:
        "Bonjour! Je suis votre assistant concierge. Comment puis-je améliorer votre séjour?",
      instructions:
        "Je peux vous aider avec des recommandations locales, réservations et transport.",
      examples: [
        "Pouvez-vous recommander de bons restaurants à proximité?",
        "J'ai besoin d'un taxi pour l'aéroport",
        "Quelles attractions touristiques valent la peine d'être visitées?",
      ],
      fallback:
        "Je suis là pour vous aider avec toute demande pour rendre votre séjour plus confortable.",
    },
    zh: {
      greeting: "您好！我是您的礼宾助手。我能如何帮助您提升住宿体验？",
      instructions: "我可以协助当地推荐、预订、交通和一般咨询。",
      examples: [
        "您能推荐附近的好餐厅吗？",
        "我需要去机场的出租车",
        "有什么值得参观的旅游景点？",
      ],
      fallback: "我在这里帮助您的任何需求，让您的住宿更加舒适。",
    },
    ru: {
      greeting:
        "Здравствуйте! Я ваш помощник-консьерж. Как я могу улучшить ваше пребывание?",
      instructions:
        "Могу помочь с местными рекомендациями, бронированием, транспортом и общими вопросами.",
      examples: [
        "Можете порекомендовать хорошие рестораны поблизости?",
        "Мне нужно такси в аэропорт",
        "Какие туристические достопримечательности стоит посетить?",
      ],
      fallback:
        "Я здесь, чтобы помочь с любыми запросами для комфортного пребывания.",
    },
  },
  // Add more services like Housekeeping, Maintenance, etc.
  Housekeeping: {
    en: {
      greeting:
        "Hello! I'm here to help with housekeeping services. What can I assist you with?",
      instructions:
        "I can help with room cleaning, towel replacement, amenity requests, and maintenance issues.",
      examples: [
        "Please clean my room",
        "I need fresh towels",
        "Can you bring extra pillows?",
      ],
      fallback: "I can help with housekeeping and room maintenance requests.",
    },
    vi: {
      greeting:
        "Xin chào! Tôi ở đây để giúp dịch vụ dọn phòng. Tôi có thể hỗ trợ gì?",
      instructions:
        "Tôi có thể hỗ trợ dọn phòng, thay khăn, yêu cầu tiện nghi và vấn đề bảo trì.",
      examples: [
        "Làm ơn dọn phòng cho tôi",
        "Tôi cần khăn sạch",
        "Bạn có thể mang thêm gối không?",
      ],
      fallback: "Tôi có thể giúp các yêu cầu dọn phòng và bảo trì.",
    },
    // Add other languages...
    fr: {
      greeting: "Bonjour! Je suis là pour les services de ménage.",
      instructions: "",
      examples: [],
      fallback: "",
    },
    zh: {
      greeting: "您好！我来帮助客房清洁服务。",
      instructions: "",
      examples: [],
      fallback: "",
    },
    ru: {
      greeting: "Здравствуйте! Я здесь для услуг уборки.",
      instructions: "",
      examples: [],
      fallback: "",
    },
  },
};

export const VoiceCommandContext: React.FC<VoiceCommandContextProps> = ({
  selectedService,
  isCallActive = false,
  onVoicePromptReady,
  className = "",
}) => {
  const { language } = useAssistant();
  const [currentPrompt, setCurrentPrompt] = useState<VoicePrompt | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDisappearing, setIsDisappearing] = useState(false);
  const isMobile = useIsMobile();

  // Generate voice prompt based on selected service and language
  const generateVoicePrompt = useCallback(
    (service: ServiceItem, lang: Language): VoicePrompt | null => {
      const servicePrompts = VOICE_PROMPTS[service.name];
      if (!servicePrompts || !servicePrompts[lang]) {
        logger.warn(
          `No voice prompts found for service: ${service.name}, language: ${lang}`,
          "Component",
        );
        return null;
      }

      return {
        service: service.name,
        language: lang,
        prompts: servicePrompts[lang],
      };
    },
    [],
  );

  // Update prompt when service or language changes
  useEffect(() => {
    if (!selectedService) {
      // Animate out before clearing
      if (currentPrompt) {
        setIsDisappearing(true);
        setTimeout(() => {
          setCurrentPrompt(null);
          setIsReady(false);
          setIsDisappearing(false);
        }, 400);
      }
      return;
    }

    logger.debug(
      `🎤 [VoiceCommandContext] Generating prompt for service: ${selectedService.name}, language: ${language}`,
      "Component",
    );

    const prompt = generateVoicePrompt(selectedService, language as any);
    if (prompt) {
      setCurrentPrompt(prompt);
      setIsReady(true);
      onVoicePromptReady?.(prompt);

      logger.debug(
        `✅ [VoiceCommandContext] Voice prompt ready for: ${selectedService.name}`,
        "Component",
      );
    } else {
      setCurrentPrompt(null);
      setIsReady(false);

      logger.warn(
        `❌ [VoiceCommandContext] No prompt available for: ${selectedService.name}`,
        "Component",
      );
    }
  }, [selectedService, language, generateVoicePrompt, onVoicePromptReady]); // ✅ FIXED: Removed currentPrompt to prevent infinite loop

  // Inject voice context into window for voice assistant integration
  useEffect(() => {
    if (typeof window !== "undefined" && currentPrompt && isCallActive) {
      (window as any).voiceCommandContext = {
        service: currentPrompt.service,
        language: currentPrompt.language,
        prompts: currentPrompt.prompts,
        isActive: true,
        guidance: voiceGuidanceEnabled,
      };

      logger.debug(
        `🌐 [VoiceCommandContext] Voice context injected for active call`,
        "Component",
      );
    } else if (typeof window !== "undefined") {
      (window as any).voiceCommandContext = {
        isActive: false,
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).voiceCommandContext;
      }
    };
  }, [currentPrompt, isCallActive, voiceGuidanceEnabled]);

  // Add notification when voice context is ready with enhanced messaging
  useEffect(() => {
    if (isReady && currentPrompt && selectedService) {
      addMultiLanguageNotification(
        "voiceContextReady",
        language,
        { service: selectedService.name },
        {
          type: "info",
          duration: 3000,
          metadata: {
            serviceName: selectedService.name,
            language,
            hasVoicePrompts: true,
            promptsAvailable: Object.keys(
              VOICE_PROMPTS[selectedService.name] || {},
            ).length,
          },
        },
      );
    }
  }, [isReady, currentPrompt, selectedService, language]);

  // Enhanced voice guidance during call
  useEffect(() => {
    if (isCallActive && currentPrompt && voiceGuidanceEnabled) {
      const guidanceTimer = setTimeout(() => {
        if (
          "speechSynthesis" in window &&
          typeof window.speechSynthesis !== "undefined" &&
          currentPrompt
        ) {
          const utterance = new window.SpeechSynthesisUtterance(
            currentPrompt.prompts.greeting,
          );
          utterance.lang =
            language === "en"
              ? "en-US"
              : language === "vi"
                ? "vi-VN"
                : language === "fr"
                  ? "fr-FR"
                  : language === "zh"
                    ? "zh-CN"
                    : language === "ru"
                      ? "ru-RU"
                      : language === "ko"
                        ? "ko-KR"
                        : "en-US";
          utterance.rate = 0.9;
          utterance.volume = 0.6;

          window.speechSynthesis.speak(utterance);
          logger.debug(
            `🔊 [VoiceCommandContext] Voice guidance provided for ${currentPrompt.service}`,
            "Component",
          );
        }
      }, 2000);
      return () => clearTimeout(guidanceTimer);
    }
  }, [isCallActive, currentPrompt, voiceGuidanceEnabled, language]);

  // Handle minimize/restore
  const toggleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  // Handle close
  const handleClose = useCallback(() => {
    setIsDisappearing(true);
    setTimeout(() => {
      setCurrentPrompt(null);
      setIsReady(false);
      setIsDisappearing(false);
    }, 400);
  }, []);

  if (!selectedService || !currentPrompt) {
    return null;
  }

  return (
    <div className={`voice-command-context ${className}`}>
      {/* Enhanced Voice Context Indicator with Mobile Support */}
      {isCallActive && isReady && (
        <div
          className={`
          voice-context-indicator ${isMobile ? "mobile" : ""} ${isDisappearing ? "disappearing" : ""}
          fixed ${isMobile ? "top-16 left-2 right-2" : "top-24 right-4"} 
          bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-xl z-40 
          ${isMobile ? "max-w-full" : "max-w-sm"} 
          border border-white/20 backdrop-blur-sm transition-all duration-300
          ${isMinimized ? "transform scale-95 opacity-80" : ""}
          voice-context-pulse
        `}
        >
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span
                className={`font-semibold ${isMobile ? "text-sm" : "text-sm"}`}
              >
                🎤 Voice Context Active
              </span>
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center gap-1">
              {!isMobile && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </button>

              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Enhanced Content */}
          {!isMinimized && (
            <div className="px-3 pb-3">
              <div className={`space-y-2 ${isMobile ? "text-xs" : "text-xs"}`}>
                <div>
                  <div className="font-medium text-white/90">
                    {selectedService.name}
                  </div>
                  <div className="text-white/75 text-xs">
                    {currentPrompt.prompts.instructions}
                  </div>
                </div>

                {/* Example Commands - Mobile Condensed */}
                {!isMobile && (
                  <div className="space-y-1">
                    <div className="text-white/80 font-medium text-xs">
                      Example commands:
                    </div>
                    <div className="space-y-0.5">
                      {currentPrompt.prompts.examples
                        .slice(0, 2)
                        .map((example, index) => (
                          <div
                            key={index}
                            className="text-white/70 text-xs italic"
                          >
                            "/{example}/"
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Settings Panel */}
                {showSettings && !isMobile && (
                  <div className="border-t border-white/20 pt-2 space-y-2">
                    <div className="text-white/80 font-medium text-xs">
                      Voice Settings:
                    </div>

                    {/* Voice guidance toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/75 flex items-center gap-1">
                        {voiceGuidanceEnabled ? (
                          <Mic className="w-3 h-3" />
                        ) : (
                          <MicOff className="w-3 h-3" />
                        )}
                        Voice Guidance
                      </span>
                      <button
                        onClick={() =>
                          setVoiceGuidanceEnabled(!voiceGuidanceEnabled)
                        }
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          voiceGuidanceEnabled
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {voiceGuidanceEnabled ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile-specific voice guidance toggle */}
                {isMobile && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <span className="text-xs text-white/75 flex items-center gap-1">
                      {voiceGuidanceEnabled ? (
                        <Volume2 className="w-3 h-3" />
                      ) : (
                        <VolumeX className="w-3 h-3" />
                      )}
                      Voice Guidance
                    </span>
                    <button
                      onClick={() =>
                        setVoiceGuidanceEnabled(!voiceGuidanceEnabled)
                      }
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        voiceGuidanceEnabled
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {voiceGuidanceEnabled ? "ON" : "OFF"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Debug Info (Development Only) */}
      {import.meta.env.DEV && currentPrompt && (
        <div
          className={`
          fixed bottom-4 left-4 bg-black/90 text-green-400 p-3 rounded-lg text-xs font-mono z-50 
          ${isMobile ? "max-w-xs" : "max-w-xs"} 
          border border-green-500/30 backdrop-blur-sm
          ${isDisappearing ? "opacity-50" : ""}
        `}
        >
          <div className="text-green-300 font-bold mb-2">
            🎤 Voice Context Debug
          </div>
          <div className="space-y-1 text-xs">
            <div>
              Service:{" "}
              <span className="text-white">{currentPrompt.service}</span>
            </div>
            <div>
              Language:{" "}
              <span className="text-white">{currentPrompt.language}</span>
            </div>
            <div>
              Ready: <span className="text-white">{isReady ? "✅" : "❌"}</span>
            </div>
            <div>
              Call Active:{" "}
              <span className="text-white">{isCallActive ? "✅" : "❌"}</span>
            </div>
            <div>
              Voice Guidance:{" "}
              <span className="text-white">
                {voiceGuidanceEnabled ? "✅" : "❌"}
              </span>
            </div>
            <div>
              Mobile:{" "}
              <span className="text-white">{isMobile ? "✅" : "❌"}</span>
            </div>
            <div className="pt-1 border-t border-green-500/30">
              Examples:{" "}
              <span className="text-gray-300">
                {currentPrompt.prompts.examples.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
