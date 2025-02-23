import type { Loader } from 'astro/loaders';
import { ItemSchema } from './schema';

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

      const data = await response.json();

      data.forEach(async (item: any) => {
        const parsedData = await parseData({
          id: item.id,
          data: item,
        });

        store.set({
          id: parsedData.id,
          data: parsedData,
          rendered: {
            html: parsedData.body,
          },
        });
      });
    },
    schema: ItemSchema,
  };
};
