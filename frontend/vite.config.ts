import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: { host: true, allowedHosts: true },
  resolve: { tsconfigPaths: true },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
