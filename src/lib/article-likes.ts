import { getDatabase } from '@netlify/database';

let connection: ReturnType<typeof getDatabase> | undefined;

function database() {
  // Astro's Netlify adapter runs in Lambda compatibility mode.
  if (!connection) {
    connection = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
    connection.pool.on('error', () => console.error('Article likes database connection lost'));
  }
  return connection;
}

export async function getArticleLikes(articleId: string, browserId: string) {
  const [result] = await database().sql<{ count: number; liked: boolean }>`
    SELECT COUNT(*)::integer AS count,
      COALESCE(BOOL_OR(browser_id = ${browserId}::uuid), false) AS liked
    FROM article_likes WHERE article_id = ${articleId}
  `;
  return result;
}

export async function setArticleLike(articleId: string, browserId: string, liked: boolean) {
  if (liked) {
    await database().sql`
      INSERT INTO article_likes (article_id, browser_id)
      VALUES (${articleId}, ${browserId}::uuid)
      ON CONFLICT (article_id, browser_id) DO NOTHING
    `;
  } else {
    await database().sql`
      DELETE FROM article_likes WHERE article_id = ${articleId} AND browser_id = ${browserId}::uuid
    `;
  }
  return getArticleLikes(articleId, browserId);
}
