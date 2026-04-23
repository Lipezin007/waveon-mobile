import ptBR from './ptBR';

function interpolate(text, vars) {
  if (!vars) return text;

  return Object.keys(vars).reduce((acc, key) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(vars[key]));
  }, text);
}

export function translate(language, key, fallback = '', vars) {
  let translated = fallback;

  if (language === 'pt') {
    translated = ptBR[key] || fallback;
  }

  return interpolate(translated, vars);
}