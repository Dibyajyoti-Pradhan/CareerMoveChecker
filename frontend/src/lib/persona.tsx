import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Persona = 'candidate' | 'freelancer' | 'agency';

export const PERSONAS: Persona[] = ['candidate', 'freelancer', 'agency'];

export const PERSONA_LABEL: Record<Persona, string> = {
  candidate: 'Job candidate',
  freelancer: 'Freelancer',
  agency: 'Recruitment agency',
};

const KEY = 'cmc.persona';

interface Ctx {
  persona: Persona;
  setPersona: (p: Persona) => void;
}

const PersonaCtx = createContext<Ctx | null>(null);

function read(): Persona {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'candidate' || v === 'freelancer' || v === 'agency') return v;
  } catch {}
  return 'candidate';
}

export function PersonaProvider({ children, force }: { children: ReactNode; force?: Persona }) {
  const [persona, setPersonaState] = useState<Persona>(() => force ?? read());

  useEffect(() => {
    if (force) {
      setPersonaState(force);
      try { localStorage.setItem(KEY, force); } catch {}
    }
  }, [force]);

  useEffect(() => {
    document.body.setAttribute('data-persona', persona);
  }, [persona]);

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
    try { localStorage.setItem(KEY, p); } catch {}
  }, []);

  return <PersonaCtx.Provider value={{ persona, setPersona }}>{children}</PersonaCtx.Provider>;
}

export function usePersona(): Ctx {
  const c = useContext(PersonaCtx);
  if (!c) throw new Error('usePersona must be used inside PersonaProvider');
  return c;
}
