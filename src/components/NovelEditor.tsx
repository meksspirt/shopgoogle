'use client';

import { EditorRoot, EditorContent } from 'novel';
import { useState, useEffect } from 'react';
import { useEditor } from 'novel';

interface NovelEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function NovelEditor({ content, onChange, placeholder }: NovelEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [initialContent, setInitialContent] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Преобразуем HTML в JSON для Novel
    try {
      if (content) {
        setInitialContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: content ? [{ type: 'text', text: content }] : [],
            },
          ],
        });
      }
    } catch (e) {
      console.error('Error parsing content:', e);
    }
  }, [content]);

  if (!mounted) {
    return (
      <div className="novel-editor-loading">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="novel-editor-wrapper">
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          onUpdate={({ editor }) => {
            const html = editor?.getHTML() || '';
            onChange(html);
          }}
          className="novel-editor"
          editorProps={{
            attributes: {
              class: 'novel-editor-content',
            },
          }}
        />
      </EditorRoot>
    </div>
  );
}
