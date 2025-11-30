'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isAcademicTheme, setIsAcademicTheme] = useState(false);

  useEffect(() => {
    // Проверяем сохраненную тему при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'academic') {
      setIsAcademicTheme(true);
      document.body.classList.add('academic-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isAcademicTheme;
    setIsAcademicTheme(newTheme);

    if (newTheme) {
      document.body.classList.add('academic-theme');
      localStorage.setItem('theme', 'academic');
    } else {
      document.body.classList.remove('academic-theme');
      localStorage.setItem('theme', 'clinical');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Переключить дизайн"
      title={isAcademicTheme ? 'Переключить на Clinical дизайн' : 'Переключить на Academic дизайн'}
    >
      {isAcademicTheme ? (
        <span>🎨 Clinical</span>
      ) : (
        <span>📚 Academic</span>
      )}
    </button>
  );
}
