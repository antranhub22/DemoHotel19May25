import * as React from 'react';
import { useAssistant } from '@/context';
import {
  STANDARD_POPUP_HEIGHT,
  STANDARD_POPUP_MAX_HEIGHT_VH,
  STANDARD_POPUP_MAX_WIDTH,
} from '@/context/PopupContext';
import { t } from '@/i18n';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
// Interface cho trạng thái hiển thị của mỗi message
interface VisibleCharState {
  [messageId: string]: number;
}

