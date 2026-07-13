export interface MediaAsset {
  id: string;
  filename: string;
  filepath: string;
  url: string;
  optimizedUrl?: string | null;
  size: number;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  caption?: string | null;
  tags: string[];
  folderId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string | null;
  path: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  assets?: MediaAsset[];
  _count?: {
    assets: number;
    children: number;
  };
}

export interface MediaLibraryState {
  assets: MediaAsset[];
  folders: MediaFolder[];
  currentFolderId: string | null;
  searchQuery: string;
  selectedTags: string[];
  viewMode: 'grid' | 'list';
}
