'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isAcademicTheme, setIsAcademicTheme] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Проверяем сохраненную тему при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'academic') {
      setIsAcademicTheme(true);
      document.documentElement.classList.add('academic-theme');
      document.body.classList.add('academic-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isAcademicTheme;
    setIsAcademicTheme(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('academic-theme');
      document.body.classList.add('academic-theme');
      localStorage.setItem('theme', 'academic');
    } else {
      document.documentElement.classList.remove('academic-theme');
      document.body.classList.remove('academic-theme');
      localStorage.setItem('theme', 'clinical');
    }
  };

  // Не рендерим кнопку до монтирования на клиенте
  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Переключить дизайн"
      title={isAcademicTheme ? 'Переключить на Clinical дизайн' : 'Переключить на Dark Academia дизайн'}
    >
      {isAcademicTheme ? (
        <span>🎨 Clinical</span>
      ) : (
        <span>🕯️ Dark Academia</span>
      )}
    </button>
  );
}
