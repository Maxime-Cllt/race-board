import { useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Only access localStorage and DOM on the client side
    if (typeof window !== 'undefined') {
      // Check if user has a theme preference in localStorage
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) {
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
        return savedTheme;
      }
      // Check system preference
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
      return isDark ? "dark" : "light";
    }
    // Default to light theme during SSR
    return "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  return { theme, toggleTheme };
}
