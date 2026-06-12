export const getStickyStyle = (
  rowSelection: any,
  options?: { columns: any[]; index: number },
): React.CSSProperties => {
  if (!options) {
    // For the selection column itself
    if (rowSelection?.fixed === 'left' && rowSelection?.columnWidth) {
      return { position: 'sticky', left: 0, zIndex: 2 };
    }
    if (rowSelection?.fixed === 'right' && rowSelection?.columnWidth) {
      return { position: 'sticky', right: 0, zIndex: 2 };
    }
    return {};
  }

  const { columns, index } = options;
  const style: React.CSSProperties = {};

  if (columns[index]?.fixed === 'left') {
    let left = Number(rowSelection?.columnWidth) || 0;
    for (let i = 0; i < index; i++) {
      if (columns[i]?.fixed === 'left') {
        left += Number(columns[i].width) || 0;
      }
    }
    style.position = 'sticky';
    style.left = left;
    style.zIndex = 2;
  } else if (columns[index]?.fixed === 'right') {
    let right = 0;
    for (let i = index + 1; i < columns.length; i++) {
      if (columns[i]?.fixed === 'right') {
        right += Number(columns[i].width) || 0;
      }
    }
    style.position = 'sticky';
    style.right = right;
    style.zIndex = 2;
  }

  return style;
};
