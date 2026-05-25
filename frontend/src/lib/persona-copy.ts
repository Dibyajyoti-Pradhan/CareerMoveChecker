import type { Persona } from './persona';

export const HERO_H1: Record<Persona, { plain: string; em: string; after: string }> = {
  candidate:  { plain: 'Will this company still be ', em: 'here', after: ' next year?' },
  freelancer: { plain: 'Will you actually ', em: 'get paid?', after: '' },
  agency:     { plain: 'Will you get your ', em: 'fee', after: ' — and will your candidate survive?' },
};

export const HERO_SUB: Record<Persona, string> = {
  candidate: 'A plain-English trust report on a UK employer in seconds. Companies House signals, no jargon.',
  freelancer: 'Check the client before you send the invoice. No more chasing ghosts at month-end.',
  agency: "Don't place candidates at companies that won't pay your fee — or that won't be here in 6 months.",
};

export const HERO_CTA: Record<Persona, string> = {
  candidate: 'Check this employer',
  freelancer: 'Check this client',
  agency: 'Check this client',
};

export const HERO_QUESTION: Record<Persona, string> = {
  candidate: 'Will this company still be here next year?',
  freelancer: 'Will you actually get paid?',
  agency: 'Will you get your fee — and will your candidate survive?',
};

export const SAVED_TITLE_EM: Record<Persona, string> = {
  candidate: 'shortlist',
  freelancer: 'client list',
  agency: 'watch list',
};

export const SAVED_SUB: Record<Persona, string> = {
  candidate: 'Companies you might join, kept handy with notes.',
  freelancer: 'Clients you invoice, kept with notes for next month.',
  agency: 'Clients on your roster — watch for changes that put fees or candidates at risk.',
};

export const SAVED_STAT_LABEL: Record<Persona, string> = {
  candidate: 'Likely to last',
  freelancer: 'Likely to pay',
  agency: 'Safe to place',
};

export const SAVED_FILTER_LABEL: Record<Persona, string> = {
  candidate: 'Safe',
  freelancer: 'Likely to pay',
  agency: 'Safe to place',
};

export const SAVE_CTA_LABEL: Record<Persona, string> = {
  candidate: 'Save to shortlist',
  freelancer: 'Save client',
  agency: 'Add to watch list',
};

export const PERSONA_TIER: Record<Persona, { tier: string; price: string }> = {
  candidate: { tier: 'Free', price: '£0' },
  freelancer: { tier: 'Pro', price: '£19/mo' },
  agency: { tier: 'Agency', price: '£79/mo' },
};
