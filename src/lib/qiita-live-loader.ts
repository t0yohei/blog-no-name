import type { LiveDataEntry } from 'astro';
import type { LiveLoader } from 'astro/loaders';
import { z } from 'astro/zod';

const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.url(),
  body: z.string(),
  created_at: z.coerce.date(),
});

export type QiitaArticle = z.infer<typeof articleSchema>;

export function qiitaLiveLoader(url: string): LiveLoader<QiitaArticle, { id: string }> {
  const loadEntries = async (): Promise<LiveDataEntry<QiitaArticle>[]> => {
    const entries: LiveDataEntry<QiitaArticle>[] = [];
    const token = process.env.QIITA_AUTH_TOKEN;
    for (let page = 1; ; page++) {
      const pageUrl = new URL(url);
      pageUrl.searchParams.set('per_page', '100');
      pageUrl.searchParams.set('page', String(page));
      const response = await fetch(pageUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Failed to fetch Qiita articles: ${response.status}`);
      const articles = z.array(articleSchema).parse(await response.json());
      entries.push(...articles.map(data => ({ id: data.id, data })));
      if (articles.length < 100) return entries;
    }
  };

  return {
    name: 'qiita-live-loader',
    loadCollection: async () => ({ entries: await loadEntries() }),
    loadEntry: async ({ filter }) => (await loadEntries()).find(entry => entry.id === filter.id),
  };
}
