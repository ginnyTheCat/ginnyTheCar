export interface Memes {
    [id: string]: Meme;
}

export interface Meme {
    url: string;
    from?: number;
    to?: number;
    tags: string[];
    audioOnly?: boolean;
}