// ButtonContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type Ctx = {
  enabledMap: Record<string, boolean>;
  setEnabledFor: (id: string, v: boolean) => void;
};

const ButtonContext = createContext<Ctx | undefined>(undefined);

export const ButtonProvider = ({ children }: { children: ReactNode }) => {
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});

  const setEnabledFor = (id: string, v: boolean) =>
    setEnabledMap(prev => ({ ...prev, [id]: v }));

  return (
    <ButtonContext.Provider value={{ enabledMap, setEnabledFor }}>
      {children}
    </ButtonContext.Provider>
  );
};

export const useButtonRoot = () => {
  const ctx = useContext(ButtonContext);
  if (!ctx) throw new Error("useButtonRoot must be inside ButtonProvider");
  return ctx;
};

/* İsteğe bağlı: id alan, hazır “alt” hook */
export const useComponentButton = (id: string) => {
  const { enabledMap, setEnabledFor } = useButtonRoot();
  return {
    enabled: enabledMap[id] ?? false,
    setEnabled: (v: boolean) => setEnabledFor(id, v),
  };
};
