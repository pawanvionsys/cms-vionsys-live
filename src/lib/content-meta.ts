import type { Prisma } from '@prisma/client';

type DefaultContentMetaInput = {
  title: string;
  description: string;
  focusKeyword: string;
  schemaType: string;
};

/** Create standalone SEO/AEO/schema records and return IDs for parent FK fields. */
export async function createDefaultContentMeta(
  tx: Prisma.TransactionClient,
  input: DefaultContentMetaInput
) {
  const [seoMeta, aeoGeoMeta, schemaSettings] = await Promise.all([
    tx.seoMeta.create({
      data: {
        title: input.title,
        description: input.description,
        focusKeyword: input.focusKeyword,
        secondaryKeywords: [],
        index: true,
        follow: true,
        twitterCardType: 'summary_large_image',
      },
    }),
    tx.aeoGeoMeta.create({
      data: {
        directAnswerPrompt: '',
        snippetCandidate: '',
        keyTakeaways: [],
        allowAiCrawler: true,
      },
    }),
    tx.schemaSettings.create({
      data: {
        type: input.schemaType,
      },
    }),
  ]);

  return {
    seoMetaId: seoMeta.id,
    aeoGeoMetaId: aeoGeoMeta.id,
    schemaSettingsId: schemaSettings.id,
  };
}
