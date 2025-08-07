import * as React from 'react';
/// <reference types="vite/client" />

// Type declaration for import.meta

import type { Room } from '@/types/common.types';
import {
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAssistant } from '@/context';
import { useIsMobile } from '@/hooks/use-mobile';
import { Language, ServiceItem } from '@/types/interface1.types';
import logger from '@shared/utils/logger';
import { addMultiLanguageNotification } from './MultiLanguageNotificationHelper';

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
  Record<Language, VoicePrompt['prompts']>
> = {
  'Room Service': {
    en: {
      greeting:
        "Hello! I'm your room service assistant. What would you like to order?",
      instructions:
        'You can order food, drinks, or request dining setup in your room.',
      examples: [
        "I'd like to order breakfast for two",
        'Can I get a bottle of wine delivered?',
        'Please bring clean towels and toiletries',
      ],
      fallback:
        'I can help you with room service orders. Please tell me what you need.',
    },
    vi: {
      greeting:
        'Xin chào! Tôi là trợ lý dịch vụ phòng. Quý khách muốn gọi món gì?',
      instructions:
        'Quý khách có thể gọi món ăn, đồ uống, hoặc yêu cầu setup bàn ăn trong phòng.',
      examples: [
        'Tôi muốn gọi bữa sáng cho hai người',
        'Cho tôi một chai rượu vang được không?',
        'Làm ơn mang khăn sạch và đồ dùng vệ sinh',
      ],
      fallback:
        'Tôi có thể giúp quý khách đặt dịch vụ phòng. Xin hãy cho biết quý khách cần gì.',
    },
    fr: {
      greeting:
        'Bonjour! Je suis votre assistant de service en chambre. Que souhaitez-vous commander?',
      instructions:
        'Vous pouvez commander de la nourriture, des boissons, ou demander un service de table.',
      examples: [
        "J'aimerais commander le petit-déjeuner pour deux",
        'Puis-je avoir une bouteille de vin livrée?',
        'Veuillez apporter des serviettes propres et des articles de toilette',
      ],
      fallback:
        'Je peux vous aider avec les commandes de service en chambre. Dites-moi ce dont vous avez besoin.',
    },
    zh: {
      greeting: '您好！我是您的客房服务助手。您想要订什么？',
      instructions: '您可以订餐食、饮品，或要求在房间内布置餐桌。',
      examples: [
        '我想为两个人订早餐',
        '可以送一瓶红酒吗？',
        '请带一些干净的毛巾和洗漱用品',
      ],
      fallback: '我可以帮您订购客房服务。请告诉我您需要什么。',
    },
    ru: {
      greeting:
        'Здравствуйте! Я ваш помощник по обслуживанию номеров. Что бы вы хотели заказать?',
      instructions:
        'Вы можете заказать еду, напитки или попросить сервировку в номере.',
      examples: [
        'Я хотел бы заказать завтрак на двоих',
        'Можно доставить бутылку вина?',
        'Пожалуйста, принесите чистые полотенца и туалетные принадлежности',
      ],
      fallback:
        'Я могу помочь с заказом обслуживания номеров. Скажите, что вам нужно.',
    },
    ko: {
      greeting: '안녕하세요! 룸서비스 도우미입니다. 무엇을 주문하시겠습니까?',
      instructions:
        '음식, 음료를 주문하시거나 객실 내 식사 준비를 요청하실 수 있습니다.',
      examples: [
        '두 명을 위한 아침식사를 주문하고 싶습니다',
        '와인 한 병을 배달받을 수 있나요?',
        '깨끗한 수건과 세면도구를 가져다 주세요',
      ],
      fallback:
        '룸서비스 주문을 도와드릴 수 있습니다. 필요한 것을 말씀해 주세요.',
    },
  },
  Restaurant: {
    en: {
      greeting:
        'Welcome to our restaurant service! How can I help you with dining?',
      instructions:
        'I can help with reservations, menu information, and special dietary requirements.',
      examples: [
        "I'd like to make a dinner reservation for tonight",
        "What's on today's special menu?",
        'Do you have vegetarian options?',
      ],
      fallback:
        'I can assist with restaurant reservations and dining information.',
    },
    vi: {
      greeting:
        'Chào mừng đến với dịch vụ nhà hàng! Tôi có thể giúp gì về việc ăn uống?',
      instructions:
        'Tôi có thể hỗ trợ đặt bàn, thông tin thực đơn và yêu cầu ăn kiêng đặc biệt.',
      examples: [
        'Tôi muốn đặt bàn tối nay',
        'Hôm nay có món đặc biệt gì?',
        'Có món chay không?',
      ],
      fallback: 'Tôi có thể hỗ trợ đặt bàn nhà hàng và thông tin ẩm thực.',
    },
    fr: {
      greeting:
        'Bienvenue au service restaurant! Comment puis-je vous aider avec la restauration?',
      instructions:
        'Je peux vous aider avec les réservations, informations menu et exigences diététiques.',
      examples: [
        "J'aimerais faire une réservation pour ce soir",
        "Qu'y a-t-il au menu spécial aujourd'hui?",
        'Avez-vous des options végétariennes?',
      ],
      fallback:
        'Je peux vous aider avec les réservations de restaurant et les informations culinaires.',
    },
    zh: {
      greeting: '欢迎使用餐厅服务！我能为您的用餐提供什么帮助？',
      instructions: '我可以帮助您预订、了解菜单信息和特殊饮食要求。',
      examples: ['我想预订今晚的晚餐', '今天有什么特色菜？', '有素食选择吗？'],
      fallback: '我可以协助餐厅预订和用餐信息咨询。',
    },
    ru: {
      greeting:
        'Добро пожаловать в ресторанный сервис! Как я могу помочь с питанием?',
      instructions:
        'Могу помочь с бронированием, информацией о меню и особыми диетическими требованиями.',
      examples: [
        'Я хотел бы забронировать ужин на сегодня',
        'Что есть в сегодняшнем специальном меню?',
        'У вас есть вегетарианские блюда?',
      ],
      fallback:
        'Могу помочь с бронированием ресторана и информацией о питании.',
    },
    ko: {
      greeting:
        '레스토랑 서비스에 오신 것을 환영합니다! 식사와 관련해 어떻게 도와드릴까요?',
      instructions:
        '예약, 메뉴 정보, 특별 식단 요구사항을 도와드릴 수 있습니다.',
      examples: [
        '오늘 저녁 예약을 하고 싶습니다',
        '오늘의 특별 메뉴는 무엇인가요?',
        '채식 옵션이 있나요?',
      ],
      fallback: '레스토랑 예약과 식사 정보를 도와드릴 수 있습니다.',
    },
  },
  Concierge: {
    en: {
      greeting:
        "Hello! I'm your concierge assistant. How can I help enhance your stay?",
      instructions:
        'I can assist with local recommendations, bookings, transportation, and general inquiries.',
      examples: [
        'Can you recommend good restaurants nearby?',
        'I need a taxi to the airport',
        'What tourist attractions are worth visiting?',
      ],
      fallback:
        "I'm here to help with any requests to make your stay more comfortable.",
    },
    vi: {
      greeting:
