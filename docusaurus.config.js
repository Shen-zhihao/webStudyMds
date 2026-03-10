// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Shen Zhihao",
  tagline: "Frontend Engineer · Notes · Engineering Practice",
  favicon: "img/favicon.ico",

  url: "https://Shen-zhihao.github.io",
  baseUrl: "/webStudyMds/",

  organizationName: "Shen-zhihao",
  projectName: "webStudyMds",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  markdown: {
    format: "detect",
  },

  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/docs",
          sidebarPath: "./sidebars.js",
          editUrl: "https://github.com/Shen-zhihao/webStudyMds/tree/main/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ["en", "zh"],
        docsRouteBasePath: "/docs",
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "light",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Shen Zhihao",
        items: [
          {
            to: "/",
            label: "主页",
            position: "left",
          },
          {
            to: "/docs/",
            label: "知识库",
            position: "left",
          },
          {
            href: "https://github.com/Shen-zhihao/webStudyMds",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "专题入口",
            items: [
              { label: "React", to: "/docs/react/react-basics" },
              { label: "JavaScript", to: "/docs/javascript/js-basics" },
              { label: "Node.js", to: "/docs/nodejs/nodejs-basics" },
              {
                label: "前端工程化",
                to: "/docs/engineering/engineering-architecture",
              },
            ],
          },
          {
            title: "个人主页",
            items: [
              { label: "首页", to: "/" },
              { label: "文档总览", to: "/docs/" },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Shen Zhihao. Built with Docusaurus.`,
      },
      prism: {
        theme: require("prism-react-renderer").themes.github,
        darkTheme: require("prism-react-renderer").themes.dracula,
        additionalLanguages: ["bash", "json", "typescript", "scss", "less"],
      },
    }),
};

module.exports = config;
