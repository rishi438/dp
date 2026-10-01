import { useEffect, useState } from 'react';

const chapters = import.meta.glob('../content/chapters/**/*.md', { query: '?raw', import: 'default' });

export function useChapterMarkdown(folder, filename) {
  const key = `../content/chapters/${folder}/${filename}`;
  const [loaded, setLoaded] = useState({ key: '', text: '' });
  useEffect(() => {
    let active = true;
    const loader = chapters[key];
    if (!loader) { setLoaded({ key, text: '# Chapter not found\nSelect another chapter.' }); return; }
    loader().then(text => { if (active) setLoaded({ key, text }); }).catch(() => { if (active) setLoaded({ key, text: '# Could not load chapter\nRefresh the page to try again.' }); });
    return () => { active = false; };
  }, [key]);
  return loaded.key === key ? loaded.text : '';
}
