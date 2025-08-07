import logger from '../../../../packages/shared/utils/logger';
import dictionaryData from './dictionary/dictionary.json';

export interface DictionaryEntry {
  keyword: string;
  fragments: string[];
  type: 'word' | 'phrase' | 'name';
}

// Thêm flag để bật/tắt logging
export const ENABLE_DICTIONARY_LOGGING = true;

export const loadDictionary = async (): Promise<DictionaryEntry[]> => {
  try {
    return dictionaryData.entries as DictionaryEntry[];
  } catch (error) {
    logger.error('Error loading dictionary:', 'Component', error);
    return [];
  }
};

export const findInDictionary = (
  fragments: string[]
): DictionaryEntry | null => {
  if (ENABLE_DICTIONARY_LOGGING) {
    logger.debug('🔍 Checking fragments:', 'Component', fragments);
  }

  // Kết hợp các fragment thành chuỗi để so sánh
  const searchStr = fragments.join('').toLowerCase().replace(/[-\s]/g, '');

  if (ENABLE_DICTIONARY_LOGGING) {
    logger.debug('📝 Normalized search string:', 'Component', searchStr);
  }

  // Tìm trong dictionary
  const match =
    (dictionaryData.entries as DictionaryEntry[]).find(entry => {
      // Chuẩn hóa keyword để so sánh
      const normalizedKeyword = entry.keyword
        .toLowerCase()
        .replace(/[-\s]/g, '');

      if (ENABLE_DICTIONARY_LOGGING) {
        console.log(
          `\n📖 Checking against dictionary entry: "${entry.keyword}"`
        );
        logger.debug('   Normalized keyword:', 'Component', normalizedKeyword);
      }

      // So sánh trực tiếp chuỗi đã chuẩn hóa
      if (searchStr === normalizedKeyword) {
        if (ENABLE_DICTIONARY_LOGGING) {
          logger.debug('✅ Exact match found!', 'Component');
        }
        return true;
      }

      // Kiểm tra xem searchStr có chứa trong normalizedKeyword không
      if (
        normalizedKeyword.includes(searchStr) ||
        searchStr.includes(normalizedKeyword)
      ) {
        if (ENABLE_DICTIONARY_LOGGING) {
          logger.debug('✅ Partial match found!', 'Component');
        }
        return true;
      }

      // Tạo một sliding window để tìm các phần của từ
      let currentFragment = '';
      for (const fragment of (fragments as any[])) {
        currentFragment += fragment.toLowerCase();
        if (ENABLE_DICTIONARY_LOGGING) {
          logger.debug('   Building fragment:', 'Component', currentFragment);
        }
        if (normalizedKeyword.includes(currentFragment)) {
          // Nếu tìm thấy một phần của từ, tiếp tục tích lũy
          continue;
        }
        // Reset nếu không tìm thấy match
        currentFragment = fragment.toLowerCase();
      }

      // Kiểm tra kết quả cuối cùng
      const isMatch = currentFragment === normalizedKeyword;
      if (isMatch && ENABLE_DICTIONARY_LOGGING) {
        logger.debug('✅ Sliding window match found!', 'Component');
      }
      return isMatch;
    }) || null;

  if (ENABLE_DICTIONARY_LOGGING) {
    if (match) {
      logger.debug('\n🎯 Final match found:', 'Component', match.keyword);
    } else {
      logger.debug('\n❌ No match found in dictionary', 'Component');
    }
  }

  return match;
};

// Helper function để thêm entry mới vào dictionary
export const addToDictionary = (entry: DictionaryEntry) => {
  (dictionaryData.entries as DictionaryEntry[]).push(entry);
  if (ENABLE_DICTIONARY_LOGGING) {
    logger.debug('📚 Added new entry to dictionary:', 'Component', entry);
  }
};
