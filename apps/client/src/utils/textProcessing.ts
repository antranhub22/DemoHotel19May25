import { normalizeText } from '@/lib/sharedUtils';
import dictionaryData from '@/utils/dictionary/dictionary.json';
import { englishDictionary } from '@/utils/dictionary/englishDictionary';

interface ProcessTextResult {
  words: string[];
  positions: number[];
}

// Tạo set từ điển và tính maxPhraseLength
const phraseSet = new Set<string>();
let maxPhraseLength = 0;

// Thêm từ/cụm từ từ englishDictionary
englishDictionary.forEach(word => {
  const normalized = word.toLowerCase().replace(/\s+/g, '');
  phraseSet.add(normalized);
  if (normalized.length > maxPhraseLength) {
    maxPhraseLength = normalized.length;
  }
});

// Thêm phrase từ dictionary.json
if (dictionaryData.entries) {
  dictionaryData.entries.forEach((entry: any) => {
    const keyword = entry.keyword.toLowerCase().replace(/\s+/g, '');
    phraseSet.add(keyword);
    if (keyword.length > maxPhraseLength) {
      maxPhraseLength = keyword.length;
    }
  });
}

// Hàm tách từ theo forward maximum matching
function segmentByDictionary(text: string): string[] {
  const normalized = normalizeText(text).replace(/\s/g, ''); // Xóa khoảng trắng để tách dính liền
  const result: string[] = [];
  let i = 0;
  while (i < normalized.length) {
    let found = false;
    for (
      let len = Math.min(maxPhraseLength, normalized.length - i);
      len > 0;
      len--
    ) {
      const fragment = normalized.substr(i, len);
      if (phraseSet.has(fragment)) {
        result.push(fragment);
        i += len;
        found = true;
        break;
      }
    }
    if (!found) {
      result.push(normalized[i]);
      i++;
    }
  }
  return result;
}

// Hàm processText mới
export function processText(text: string): ProcessTextResult {
  const words = segmentByDictionary(text);
  // Tính vị trí bắt đầu của từng từ (tương đối)
  const positions: number[] = [];
  let pos = 0;
  for (const word of words as any[]) {
    positions.push(pos);
    pos += word.length + 1; // +1 cho dấu cách
  }
  return { words, positions };
}

// Hàm applySmartSpacing
export function applySmartSpacing(words: string[]): string {
  return words.join(' ');
}
