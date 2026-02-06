/**
 * @file text.ts
 * @description Text utility functions for the Stuff application.
 *              Provides helper functions for text manipulation and sanitization.
 * @author Mishat
 * @version 1.0.2
 */

/**
 * Strips HTML tags from a string and returns plain text.
 * Useful for displaying rich text content as plain text previews.
 * @param {string} html - The HTML string to strip tags from
 * @returns {string} Plain text content without HTML tags
 */
export const stripHtml = (html: string): string => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};
