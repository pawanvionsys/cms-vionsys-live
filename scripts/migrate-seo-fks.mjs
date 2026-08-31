/**
 * One-time migration: backfill seoMetaId / aeoGeoMetaId / schemaSettingsId on
 * BlogPost & CaseStudy from legacy blogPostId / caseStudyId fields on meta docs.
 *
 * Run after `prisma db push` with the updated schema:
 *   npm run db:push
 *   npm run db:migrate-seo
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RawDoc = { _id: string; blogPostId?: string; caseStudyId?: string };

async function findLegacyMeta(collection: string, field: 'blogPostId' | 'caseStudyId') {
  const result = (await prisma.$runCommandRaw({
    find: collection,
    filter: { [field]: { $exists: true, $ne: null } },
  })) as { cursor?: { firstBatch?: RawDoc[] } };

  return result.cursor?.firstBatch ?? [];
}

async function linkBlogMeta(
  collection: 'SeoMeta' | 'AeoGeoMeta' | 'SchemaSettings',
  fkField: 'seoMetaId' | 'aeoGeoMetaId' | 'schemaSettingsId'
) {
  const docs = await findLegacyMeta(collection, 'blogPostId');

  for (const doc of docs) {
    if (!doc.blogPostId) continue;

    await prisma.blogPost.updateMany({
      where: { id: doc.blogPostId, [fkField]: null },
      data: { [fkField]: doc._id },
    });

    await prisma.$runCommandRaw({
      update: collection,
      updates: [
        {
          q: { _id: doc._id },
          u: { $unset: { blogPostId: '', caseStudyId: '' } },
        },
      ],
    });
  }

  console.log(`Linked ${docs.length} ${collection} record(s) to blogs`);
}

async function linkCaseStudyMeta(
  collection: 'SeoMeta' | 'AeoGeoMeta' | 'SchemaSettings',
  fkField: 'seoMetaId' | 'aeoGeoMetaId' | 'schemaSettingsId'
) {
  const docs = await findLegacyMeta(collection, 'caseStudyId');

  for (const doc of docs) {
    if (!doc.caseStudyId) continue;

    await prisma.caseStudy.updateMany({
      where: { id: doc.caseStudyId, [fkField]: null },
      data: { [fkField]: doc._id },
    });

    await prisma.$runCommandRaw({
      update: collection,
      updates: [
        {
          q: { _id: doc._id },
          u: { $unset: { blogPostId: '', caseStudyId: '' } },
        },
      ],
    });
  }

  console.log(`Linked ${docs.length} ${collection} record(s) to case studies`);
}

async function dropLegacyIndexes() {
  for (const collection of ['SeoMeta', 'AeoGeoMeta', 'SchemaSettings']) {
    for (const index of ['blogPostId', 'caseStudyId', 'blogPostId_1', 'caseStudyId_1']) {
      try {
        await prisma.$runCommandRaw({
          dropIndexes: collection,
          index,
        });
        console.log(`Dropped index ${collection}.${index}`);
      } catch {
        // Index may not exist after db push — safe to ignore.
      }
    }
  }
}

async function main() {
  await linkBlogMeta('SeoMeta', 'seoMetaId');
  await linkCaseStudyMeta('SeoMeta', 'seoMetaId');
  await linkBlogMeta('AeoGeoMeta', 'aeoGeoMetaId');
  await linkCaseStudyMeta('AeoGeoMeta', 'aeoGeoMetaId');
  await linkBlogMeta('SchemaSettings', 'schemaSettingsId');
  await linkCaseStudyMeta('SchemaSettings', 'schemaSettingsId');
  await dropLegacyIndexes();
  console.log('SEO meta migration complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
