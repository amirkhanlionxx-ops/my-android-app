import { FileNode } from '../types';

export const persistFolderExpansion = (nodes: FileNode[], projectKey: string) => {
  if (!projectKey) return;
  const map: Record<string, boolean> = {};
  const traverse = (items: FileNode[]) => {
    for (const item of items) {
      if (item.type === 'folder') {
        map[item.id] = !!item.isOpen;
        if (item.children) traverse(item.children);
      }
    }
  };
  traverse(nodes);
  try {
    localStorage.setItem(`ide_folder_open_v2_${projectKey}`, JSON.stringify(map));
  } catch (err) {
    console.error('Error saving folder expansion state:', err);
  }
};

export const restoreFolderExpansion = (nodes: FileNode[], projectKey: string): FileNode[] => {
  if (!projectKey) return nodes;
  try {
    const raw = localStorage.getItem(`ide_folder_open_v2_${projectKey}`);
    if (raw) {
      const map: Record<string, boolean> = JSON.parse(raw);
      const apply = (items: FileNode[]): FileNode[] => {
        return items.map((item) => {
          if (item.type === 'folder') {
            const isOpen = map[item.id] !== undefined ? map[item.id] : item.isOpen;
            return {
              ...item,
              isOpen,
              children: item.children ? apply(item.children) : undefined,
            };
          }
          return item;
        });
      };
      return apply(nodes);
    }
  } catch (err) {
    console.error('Error restoring folder expansion state:', err);
  }
  return nodes;
};
