export type NodeType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  isOpen?: boolean;
  content?: string;
  children?: FileNode[];
  extension?: string;
  isDefault?: boolean;
}

export interface ProjectTemplate {
  id: number;
  name: string;
  icon: string;
  category: string;
  description: string;
  language: string;
  type: 'android' | 'flutter' | 'web';
  starterCode?: string;
  fileName?: string;
  colorAccent?: string;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  language: string;
  starterCode: string;
  expectedOutput: string;
  hint: string;
}

export interface ToolItem {
  id: number;
  name: string;
  icon: string;
  category: string;
  actionKey: string;
  badge?: string;
}

export interface AppSettings {
  theme: 'Dark' | 'Light';
  language: 'English' | 'Bengali' | 'Hindi' | 'Spanish';
  fontSize: number;
  autoSave: boolean;
  turboSpeed: number;
}
