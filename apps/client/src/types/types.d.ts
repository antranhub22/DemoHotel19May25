declare module '@/services/ReferenceService' {
  export interface ReferenceItem {
    url: string;
    title: string;
    description: string;
  }

  export const referenceService: {
    initialize: () => void;
    findReferences: (text: string) => ReferenceItem[];
  };
}

declare module '@/utils/dictionary' {
  export interface DictionaryEntry {
    keyword: string;
    fragments: string[];
    type: 'word' | 'phrase' | 'name';
  }

  export function findInDictionary(fragments: string[]): DictionaryEntry | null;
}

declare module './Reference' {
  import { ReferenceItem } from '@/services/ReferenceService';

  interface ReferenceProps {
    references: ReferenceItem[];
  }

  const Reference: React.FC<ReferenceProps>;
  export default Reference;
}

declare module './SiriCallButton' {
  interface SiriCallButtonProps {
    containerId: string;
    isListening: boolean;
    volumeLevel: number;
  }

  const SiriCallButton: React.FC<SiriCallButtonProps>;
  export default SiriCallButton;
}

// Khai báo type cho các component local
declare namespace Components {
  import { ReferenceItem } from '@/services/ReferenceService';
import { logger } from '@shared/utils/logger';

  export interface ReferenceProps {
    references: ReferenceItem[];
  }

  export interface SiriCallButtonProps {
    containerId: string;
    isListening: boolean;
    volumeLevel: number;
  }
}
