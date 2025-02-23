import type { Loader } from 'astro/loaders';
import { ItemSchema, type Item } from './schema';

export const qiitaLoader = (options: { url: string; authToken?: string }): Loader => {
  const qiitaUrl = new URL(options.url);
  return {
    name: 'qiita-loader',
    load: async ({ store, logger, parseData, meta }): Promise<void> => {
      logger.info('Loading posts from Qiita');

      const headers = options.authToken
        ? {
            Authorization: `Bearer ${options.authToken}`,
          }
        : {};
      const response = await fetch(qiitaUrl, { headers: headers as HeadersInit });

      store.clear();

      const responseJson = await response.json();

      responseJson.forEach(async (item: Item) => {
        const data = await parseData({
          id: item.id,
          data: item,
        });

        store.set({
          id: data.id,
          data,
          rendered: {
            html: data.rendered_body,
          },
        });
      });
    },
    schema: ItemSchema,
  };
};
