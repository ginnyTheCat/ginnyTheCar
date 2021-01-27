export interface Memes {
  [id: string]: Meme;
}

export interface Meme {
  id: string;
  from?: number;
  to?: number;
  tags: string[];
  audioOnly?: boolean;
}
