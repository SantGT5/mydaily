import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Design tokens for the documentation template.
 *
 * To re-brand the template, change the `brand` color ramp below (or point the
 * semantic tokens at a different ramp). Every accent in the UI is driven by
 * `colorPalette="brand"`, which is applied once at the root in `provider.tsx`.
 */
const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: {
          value:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        body: {
          value:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        mono: {
          value:
            '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        },
      },
      colors: {
        // A clean blue/teal accent ("sky") that reads well in light and dark.
        brand: {
          50: { value: "#f0f9ff" },
          100: { value: "#e0f2fe" },
          200: { value: "#bae6fd" },
          300: { value: "#7dd3fc" },
          400: { value: "#38bdf8" },
          500: { value: "#0ea5e9" },
          600: { value: "#0284c7" },
          700: { value: "#0369a1" },
          800: { value: "#075985" },
          900: { value: "#0c4a6e" },
          950: { value: "#082f49" },
        },
      },
    },
    semanticTokens: {
      colors: {
        // The keys below are the standard "colorPalette" slots Chakra reads when
        // you use `colorPalette="brand"`. Defining them makes brand a first-class
        // palette usable on Button, Link, Badge, etc.
        brand: {
          solid: {
            value: { base: "{colors.brand.600}", _dark: "{colors.brand.500}" },
          },
          contrast: {
            value: { base: "white", _dark: "white" },
          },
          fg: {
            value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          muted: {
            value: { base: "{colors.brand.100}", _dark: "{colors.brand.900}" },
          },
          subtle: {
            value: { base: "{colors.brand.50}", _dark: "{colors.brand.950}" },
          },
          emphasized: {
            value: { base: "{colors.brand.200}", _dark: "{colors.brand.800}" },
          },
          focusRing: {
            value: { base: "{colors.brand.500}", _dark: "{colors.brand.400}" },
          },
        },
      },
    },
  },
  globalCss: {
    // Note: we intentionally do NOT set `html { scroll-behavior: smooth }`
    // globally — that would animate React Router's scroll-to-top on every
    // navigation. Smooth scrolling is applied per-interaction (see the table
    // of contents), gated on `prefers-reduced-motion`.
    body: {
      bg: "bg",
      color: "fg",
    },
    "#root": {
      minHeight: "100dvh",
    },
    "::selection": {
      bg: "brand.subtle",
    },
  },
})

export const system = createSystem(defaultConfig, config)
