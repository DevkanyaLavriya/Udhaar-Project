import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "dark" | "light";
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "udhaar-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(
    () => (typeof localStorage !== "undefined" && (localStorage.getItem(storageKey) as Theme)) || defaultTheme
  );
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    const apply = (t: "dark" | "light") => {
      root.classList.remove("light", "dark");
      root.classList.add(t);
      setResolved(t);
    };

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches ? "dark" : "light");
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    apply(theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem(storageKey, t);
    setThemeState(t);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeProviderContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
