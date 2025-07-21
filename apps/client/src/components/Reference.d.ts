import { ReferenceItem } from '@/services/ReferenceService';
import { FC } from 'react';
import { logger } from '@shared/utils/logger';

export interface ReferenceProps {
  references: ReferenceItem[];
}

declare const Reference: FC<ReferenceProps>;
export default Reference;
