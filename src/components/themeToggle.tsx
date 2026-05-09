import React, { useState } from 'react';
import { FaSun, FaMoon } from "react-icons/fa";

import '../styles/view.css';

const initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
document.documentElement.setAttribute("data-theme", initialTheme);

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState(initialTheme);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  }

  return (
    <button className="themeToggle" onClick={toggleTheme}>
      {theme === 'dark' ? <FaMoon/> : <FaSun/>}
    </button>
  );
};

export default ThemeToggle;
