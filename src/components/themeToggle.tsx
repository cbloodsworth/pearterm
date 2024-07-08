import React, { useState } from 'react';
import { FaSun, FaMoon } from "react-icons/fa";

import '../styles/view.css';


const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState("dark");
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.documentElement.setAttribute("data-theme", theme);
  }
  return (
    <>
      <button onClick={toggleTheme} style={{fontSize: '1.2rem', position: "absolute", top: "1rem", right: "1rem"}}> 
      {theme === 'dark' ? <FaSun/>:<FaMoon/>}
      </button>
    </>
  );
};

export default ThemeToggle;
