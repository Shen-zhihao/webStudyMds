// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '前端学习笔记',
  tagline: 'JavaScript · React · Node.js · 前端工程化',
  favicon: 'img/favicon.ico',

  url: 'https://Shen-zhihao.github.io',
  baseUrl: '/webStudyMds/',

  organizationName: 'Shen-zhihao',
  projectName: 'webStudyMds',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  markdown: {
    format: 'md',
  },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/Shen-zhihao/webStudyMds/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ['en', 'zh'],
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: '前端学习笔记',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '文档',
          },
          {
            href: 'https://github.com/Shen-zhihao/webStudyMds',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              { label: 'JavaScript', to: '/javascript/js-basics' },
              { label: 'React', to: '/react/react-basics' },
              { label: '前端工程化', to: '/engineering/engineering-architecture' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 前端学习笔记. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['bash', 'json', 'typescript', 'scss', 'less'],
      },
    }),
};

module.exports = config;
