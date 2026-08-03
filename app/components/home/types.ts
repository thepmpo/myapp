import type { ArticleCategory } from "@/app/lib/insightsCategories";

export type HomePost = {
  id: number;
  title: string;
  content: string | null;
  author: string;
  user_id: string;
  is_question: boolean;
  image_url: string | null;
  created_at?: string | null;
};

export type HomeArticle = {
  id: number;
  title: string;
  content: string;
  category: ArticleCategory;
  author: string;
  author_id: string;
  image_url: string | null;
  created_at: string;
};

export type HomePreviewComment = {
  id: number;
  post_id: number;
  user_id: string;
  author: string;
  content: string;
  likeCount: number;
};
