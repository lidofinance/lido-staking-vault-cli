import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Lido Staking Vault CLI',
  tagline:
    'A command-line interface (CLI) tool for managing lido staking vaults. Simplify your staking operations with intuitive commands and streamlined workflows',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://lidofinance.github.io/',

  baseUrl: '/lido-staking-vault-cli/',
  organizationName: 'lidofinance',
  projectName: 'lido-staking-vault-cli',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: [],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          path: 'cli',
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/lidofinance/lido-staking-vault-cli',
          routeBasePath: '/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/lidofinance/lido-staking-vault-cli',
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    image: 'img/package_logo.png',
    navbar: {
      title: 'Lido Staking Vault CLI Docs',
      logo: {
        alt: 'Lido Staking Vault CLI Logo',
        src: 'img/favicon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'cliSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/lidofinance/lido-staking-vault-cli',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
