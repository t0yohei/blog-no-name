export type Post = {
  collection: string;
  id: string;
  data: {
    title?: string;
    pubdate?: Date;
    link?: string;
    summary?: string;
  };
  body?: string;
};
