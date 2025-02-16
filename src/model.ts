export type Post = {
  collection: string;
  id: string;
  data: {
    title?: string;
    pubdate?: Date;
    link?: string;
    description?: string;
    body?: string;
  };
  body?: string;
};
