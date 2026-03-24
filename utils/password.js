/**
 * 密码生成器 - 使用 pinyin-pro 专业拼音库
 *
 * 算法规则（只有你我知道）：
 * 1. 关键词 → 全拼小写
 * 2. 标签 → 首字母大写
 * 3. 种子 → 第一个数字 ÷ 剩余数字 = 小数
 *         取第一个非零数字 + 原始种子所有数字的键盘符号
 *
 * 最终格式：关键词全拼 + 标签首字母 + 种子字符
 */

const { pinyin } = require('pinyin-pro');

// 键盘第一行映射
const KEYBOARD_MAP = {
  '0': ')',
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '('
};

/**
 * 汉字转全拼（小写）
 */
function toPinyinLower(str) {
  return pinyin(str, { pattern: 'pinyin', toneType: 'none', type: 'array' })
    .join('')
    .toLowerCase();
}

/**
 * 汉字转首字母（大写）
 */
function toInitialsUpper(str) {
  return pinyin(str, { pattern: 'first', toneType: 'none', type: 'array' })
    .join('')
    .toUpperCase();
}

/**
 * 种子转键盘字符
 */
function seedToChars(seed) {
  const digits = (seed || '').replace(/\D/g, '');

  if (digits.length === 0) {
    return '5%';
  }

  if (digits.length === 1) {
    const d = digits[0];
    return d + KEYBOARD_MAP[d];
  }

  const firstNum = parseInt(digits[0]);
  const remainNum = parseInt(digits.slice(1)) || 1;
  const result = firstNum / remainNum;

  const resultStr = result.toString();
  let firstNonZero = null;

  for (let char of resultStr) {
    if (char === '.') continue;
    if (char === '0') continue;
    firstNonZero = char;
    break;
  }

  if (firstNonZero === null) {
    firstNonZero = digits[0];
  }

  let symbols = '';
  for (let d of digits) {
    symbols += KEYBOARD_MAP[d];
  }

  return firstNonZero + symbols;
}

/**
 * 生成密码
 */
function generatePassword(options = {}) {
  const { keyword = '', label = '', seed = '' } = options;

  if (!keyword.trim() || !label.trim() || !seed.trim()) {
    return {
      success: false,
      message: '关键词、标签、种子都不能为空'
    };
  }

  try {
    const keywordPinyin = toPinyinLower(keyword.trim());
    const labelInitials = toInitialsUpper(label.trim());
    const seedChars = seedToChars(seed.trim());
    const password = keywordPinyin + labelInitials + seedChars;

    return {
      success: true,
      password,
      meta: {
        keyword,
        label,
        seed: seed.trim(),
        keywordPinyin,
        labelInitials,
        seedChars,
        length: password.length
      }
    };

  } catch (e) {
    return {
      success: false,
      message: '生成失败：' + e.message
    };
  }
}

/**
 * 评估密码强度
 */
function evaluateStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()]/.test(password)) score += 1;

  if (score <= 2) return { level: 'weak', label: '弱', color: '#ff4d4f' };
  if (score <= 4) return { level: 'medium', label: '中', color: '#faad14' };
  return { level: 'strong', label: '强', color: '#52c41a' };
}

module.exports = {
  generatePassword,
  evaluateStrength,
  seedToChars
};
