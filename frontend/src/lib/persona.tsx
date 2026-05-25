import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Persona = 'candidate' | 'freelancer' | 'agency';

export const PERSONAS: Persona[] = ['candidate', 'freelancer', 'agency'];

export const PERSONA_LABEL: Record<Persona, string> = {
  candidate: 'Job candidate',
  freelancer: 'Freelancer',
  agency: 'Recruitment agency',
};

export const PERSONA_IX: Record<Persona, string> = {
  candidate: '01',
  freelancer: '02',
  agency: '03',
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

interface SwitchProps {
  showLabel?: boolean;
}

export function PersonaSwitch({ showLabel = true }: SwitchProps) {
  const { persona, setPersona } = usePersona();
  return (
    <div className="switch-line">
      {showLabel && <span className="lbl">I'm checking as a</span>}
      <div className="persona-switch" role="tablist" aria-label="Persona switcher">
        {PERSONAS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={p === persona}
            className={p === persona ? 'active' : ''}
            onClick={() => setPersona(p)}
          >
            <span className="ix">{PERSONA_IX[p]}</span>
            {PERSONA_LABEL[p]}
          </button>
        ))}
      </div>
    </div>
  );
}
