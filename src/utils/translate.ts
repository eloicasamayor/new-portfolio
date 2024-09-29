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
  if (lang === "es") return "© 2024 Ningún derecho reservado";
  if (lang === "en") return "© 2024 No right reserved";
  return "© 2024 Cap dret reservat";
}
