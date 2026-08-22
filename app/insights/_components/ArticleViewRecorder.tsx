'use client';

import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ANON_ID_COOKIE = 'pmpo_anon_id';

const getAnonId = () => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ANON_ID_COOKIE}=([^;]+)`));

  if (match) return match[1];

  const newId = crypto.randomUUID();
  const twoYears = 60 * 60 * 24 * 365 * 2;
  document.cookie = `${ANON_ID_COOKIE}=${newId}; path=/; max-age=${twoYears}`;
  return newId;
};

export default function ArticleViewRecorder({ articleId }: { articleId: number }) {
  useEffect(() => {
    const record = async () => {
      const { data } = await supabase.auth.getUser();
      const viewerKey = data.user ? data.user.id : getAnonId();
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: existing } = await supabase
        .from('article_views')
        .select('id')
        .eq('article_id', articleId)
        .eq('viewer_key', viewerKey)
        .gte('created_at', since)
        .maybeSingle();

      if (!existing) {
        await supabase.from('article_views').insert([{ article_id: articleId, viewer_key: viewerKey }]);
      }
    };

    record();
  }, [articleId]);

  return null;
}
