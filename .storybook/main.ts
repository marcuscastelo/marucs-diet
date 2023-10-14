import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  typescript: {
    // Needed to avoid Chunk Loading Errors: https://stackoverflow.com/questions/70637257/storybook-error-when-using-webpack5-with-next-js-app-typescript
    reactDocgen: false
  }
};
export default config;
