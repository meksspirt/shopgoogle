'use client';

import { Editor } from 'novel';
import { useState, useEffect } from 'react';

interface NovelEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function NovelEditor({ content, onChange, placeholder }: NovelEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <Editor
        defaultValue={content}
        onUpdate={(editor) => {
          const html = editor?.getHTML() || '';
          onChange(html);
        }}
        disableLocalStorage={true}
        className="novel-editor"
        editorProps={{
          attributes: {
            class: 'novel-editor-content',
          },
        }}
      />
    </div>
  );
}
