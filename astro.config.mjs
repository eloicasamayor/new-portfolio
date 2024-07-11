import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: "https://eloicasamayor.github.io",
  base: "new-portfolio",
  defaultLocale: "ca-ES",
  locales: ["es", "en", "ca-ES"],
  routing: {
    prefixDefaultLocale: false,
  },
});
