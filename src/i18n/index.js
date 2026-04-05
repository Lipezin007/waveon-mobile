import { ENABLE_PT_BR } from './translation.config';
import ptBR from './ptBR';

function interpolate(text, vars) {
  if (!vars) {
    return text;
  }

  return Object.keys(vars).reduce((acc, key) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(vars[key]));
  }, text);
}

export function t(key, fallback, vars) {
  if (!ENABLE_PT_BR) {
    return interpolate(fallback, vars);
  }

  const translated = ptBR[key] || fallback;
  return interpolate(translated, vars);
}

export { ENABLE_PT_BR };
