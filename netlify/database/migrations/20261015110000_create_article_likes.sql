CREATE TABLE article_likes (
  article_id TEXT NOT NULL,
  browser_id UUID NOT NULL,
  PRIMARY KEY (article_id, browser_id)
);
