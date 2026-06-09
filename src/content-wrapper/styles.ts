import type { CSSProperties } from 'react';

export const wrapperStyle: CSSProperties = {
  position: 'relative',
  height: 'calc(100vh - var(--gm-framework-size-top-right-height))',
  padding: 15,
  fontWeight: 'normal',
  fontSize: 14,
  lineHeight: 'normal',
  backgroundColor: '#f5f5f5',
};

export const scrollbarCSS = `
.content-wrapper-viewbox::-webkit-scrollbar {
  width: 8px;
  padding-right: 2px;
}
.content-wrapper-viewbox::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}
.content-wrapper-viewbox::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}
.hide-scrollbar::-webkit-scrollbar-thumb,
.hide-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.075);
}
`;
