import { useRef, RefObject } from 'react';

/**
 * Hook quản lý layout refs cho Interface1
 * Tách riêng để dễ maintain và test
 */
export interface Interface1Layout {
  refs: {
    heroSectionRef: RefObject<HTMLDivElement>;
    serviceGridRef: RefObject<HTMLDivElement>;
    conversationRef: RefObject<HTMLDivElement>;
    rightPanelRef: RefObject<HTMLDivElement>;
  };
}

export const useInterface1Layout = (): Interface1Layout => {
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const serviceGridRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  return {
    refs: {
      heroSectionRef,
      serviceGridRef,
      conversationRef,
      rightPanelRef
    }
  };
}; 