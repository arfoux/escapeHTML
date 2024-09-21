const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const escapeHtmlInCode = (text) => {
  return text.replace(/<code>([\s\S]*?)<\/code>/g, (match, p1) => {
    const escapedCode = p1
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    return `<code>${escapedCode}</code>`;
  });
};

const convertToHtml = (text) => {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  let codeBlocks = [];
  text = text.replace(codeBlockRegex, (match, p1) => {
    const placeholder = `<!--CODEBLOCK${codeBlocks.length}-->`;
    codeBlocks.push(p1);
    return placeholder;
  });

  const inlineCodeRegex = /`([^`]+?)`/g;
  let inlineCodes = [];
  text = text.replace(inlineCodeRegex, (match, p1) => {
    const placeholder = `<!--INLINECODE${inlineCodes.length}-->`;
    inlineCodes.push(p1);
    return placeholder;
  });

  text = text.replace(/^\* (.*)$/gm, (match, p1) => {
    return `<blockquote>🧩 ${p1}</blockquote>`;
  });

  text = text.replace(/^\d+\.\s(.*)$/gm, (match, p1) => {
    return `<blockquote>${match}</blockquote>`;
  });

  text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  text = text.replace(/\[([^\]]+?)\]\((https?:\/\/[^\s]+?)\)/g, (match, p1, p2) => {
    return `<a href="${p2}">${p1}</a>`;
  });
  text = text.replace(/https?:\/\/[^\s]+/g, (url) => {
    return `<blockquote>${url}</blockquote>`;
  });

  text = text.replace(/<!--INLINECODE(\d+?)-->/g, (match, p1) => {
    return `<code>${inlineCodes[p1]}</code>`;
  });

  text = text.replace(/<!--CODEBLOCK(\d+?)-->/g, (match, p1) => {
    return `<pre><code>${codeBlocks[p1]}</code></pre>`;
  });

  text = escapeHtmlInCode(text);

  const sanitizedText = purify.sanitize(text);

  return sanitizedText;
};

module.exports = { convertToHtml };
