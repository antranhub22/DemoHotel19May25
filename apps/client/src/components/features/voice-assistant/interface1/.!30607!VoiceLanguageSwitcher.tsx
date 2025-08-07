import * as React from 'react';
import { useAssistant } from '@/context';
import { useIsMobile } from '@/hooks/use-mobile';
import { Language } from '@/types/interface1.types';
import logger from '@shared/utils/logger';
import {
  CheckCircle,
  ChevronDown,
  Mic,
  Smartphone,
  Volume2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  voiceId?: string;
  accent: string;
  sampleText: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
