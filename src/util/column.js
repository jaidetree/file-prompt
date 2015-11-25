import colors from 'chalk';

/**
 * Column
 * Creates a text column to ensure it takes up the max length characters
 *
 * @param {string} text - Initial content text
 * @param {int} maxLength - Maximum length to fill
 * @returns {string} Column formatted text
 */
export default function column (text, maxLength) {
  let plainText = colors.stripColor(text),
      diff = maxLength - plainText.length,
      spacer = diff > 0 ? ' '.repeat(diff) : '';

  return `${text}${spacer}`;
};