export interface MangaDexResponse<T> {
  result: string;
  response: string;
  data: T;
  limit?: number;
  offset?: number;
  total?: number;
}

export interface MangaAttributes {
  title: Record<string, string>;
  altTitles: Record<string, string>[];
  description: Record<string, string>;
  status: string;
  year: number | null;
  contentRating: string;
  tags: TagEntity[];
  state: string;
  lastChapter: string;
  lastVolume: string;
}

export interface TagEntity {
  id: string;
  type: string;
  attributes: {
    name: Record<string, string>;
    group: string;
  };
}

export interface Relationship {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
}

export interface MangaEntity {
  id: string;
  type: string;
  attributes: MangaAttributes;
  relationships: Relationship[];
}

export interface ChapterAttributes {
  title: string | null;
  volume: string | null;
  chapter: string | null;
  translatedLanguage: string;
  pages: number;
  publishAt: string;
}

export interface ChapterEntity {
  id: string;
  type: string;
  attributes: ChapterAttributes;
  relationships: Relationship[];
}

export interface AtHomeResponse {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}
