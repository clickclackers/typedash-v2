import { createContext } from 'react';

interface authInterface {
  user: string | undefined;
  setUser: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const authContext = createContext<authInterface | null>(null);
