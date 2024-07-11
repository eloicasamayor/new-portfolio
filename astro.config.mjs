import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: "https://eloicasamayor.github.io",
  base: "new-portfolio",
  defaultLocale: "ca",
  locales: ["es", "en", "ca", "ca-ES"],
  routing: {
    prefixDefaultLocale: false,
  },
});
