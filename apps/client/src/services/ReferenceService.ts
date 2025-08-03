import { logger } from '@shared/utils/logger';

export interface ReferenceItem {
  url: string;
  title: string;
  description: string;
  keywords: string[];
}

interface ReferenceMap {
  [key: string]: ReferenceItem;
}

class ReferenceService {
  private referenceMap: ReferenceMap = {};

  async initialize() {
    try {
      const response = await fetch('/assets/references/reference-map.json');
      this.referenceMap = await response.json();
      logger.debug('Loaded referenceMap:', 'Component', this.referenceMap);
    } catch (error) {
      logger.error('Error loading reference map:', 'Component', error);
    }
  }

  findReferences(content: string): ReferenceItem[] {
    const normalizedContent = content.toLowerCase();
    const matches: ReferenceItem[] = [];

    // Check each reference item for matching keywords
    Object.values(this.referenceMap).forEach(item => {
      const hasMatch = item.keywords.some(keyword =>
        normalizedContent.includes(keyword.toLowerCase())
      );

      if (hasMatch && !matches.find(m => m.url === item.url)) {
        matches.push(item);
      }
    });

    return matches;
  }

  async addReference(key: string, reference: ReferenceItem) {
    this.referenceMap[key] = reference;
    // Optionally save to backend
    try {
      await fetch('/api/references', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reference,
          id: key,
        }),
      });
    } catch (error) {
      logger.error('Error saving reference:', 'Component', error);
    }
  }
}

export const referenceService = new ReferenceService();
export { ReferenceService };
