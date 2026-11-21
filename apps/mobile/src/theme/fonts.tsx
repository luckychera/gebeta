import { createContext, useContext } from 'react';

const FontsContext = createContext(false);

export function FontsProvider({
  ready,
  children,
}: {
  ready: boolean;
  children: React.ReactNode;
}) {
  return <FontsContext.Provider value={ready}>{children}</FontsContext.Provider>;
}

export function useFontsReady(): boolean {
  return useContext(FontsContext);
}
