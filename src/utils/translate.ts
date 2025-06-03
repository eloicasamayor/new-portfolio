export function getHome(lang: string) {
  if (lang === "es") return "Inicio";
  if (lang === "en") return "Home";
  return "Inici";
}

export function getExperience(lang: string) {
  if (lang === "es") return "Experiencia";
  if (lang === "en") return "Experience";
  return "Experiència";
}

export function getProjects(lang: string) {
  if (lang === "es") return "Proyectos";
  if (lang === "en") return "Projects";
  return "Projectes";
}

export function getFooterText(lang: string) {
  if (lang === "es") return "Basado en portfolio.dev de @midudev ❤️";
  if (lang === "en") return "Based on portfolio.dev by @midudev ❤️";
  return "Basat en portfolio.dev de @midudev ❤️";
}
