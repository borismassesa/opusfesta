import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { articles, getArticleBySlug } from '@/lib/data';
import PageLayout from '@/components/PageLayout';
import ArticleContent from '@/components/ArticleContent';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Not Found' };
  return {
    title: `${article.title} | OpusFesta Studio`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <PageLayout>
      <ArticleContent article={article} />
    </PageLayout>
  );
}
