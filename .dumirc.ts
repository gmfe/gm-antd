import { defineConfig } from 'dumi';

export default defineConfig({
  resolve: {
    docDirs: ['doc'],
    atomDirs: [{ type: 'component', dir: 'src' }],
    entryFile: './src/index.ts',
    codeBlockMode: 'active',
    forceKebabCaseRouting: true,
  },
  apiParser: {},
  locales: [{ id: 'zh-CN', name: '中文' }],
  themeConfig: {
    name: 'gm-antd',
    footer: 'GM Component Library',
    nav: [
      { title: '指南', link: '/guide/get-started' },
      { title: '组件', link: '/components/table' },
    ],
    sidebar: {
      '/components': [
        {
          title: '通用',
          children: [
            { title: 'Button 按钮', link: '/components/button' },
            { title: 'Select 选择器', link: '/components/select' },
          ],
        },
        {
          title: '布局',
          children: [
            { title: 'ContentWrapper', link: '/components/content-wrapper' },
          ],
        },
        {
          title: '数据展示',
          children: [
            { title: 'Icon 图标', link: '/components/icon' },
            { title: 'Sortable 拖拽排序', link: '/components/sortable' },
            { title: 'TableFilter 筛选', link: '/components/table-filter' },
            { title: 'TablePagination 分页', link: '/components/table-pagination' },
          ],
        },
        {
          title: 'Table',
          children: [
            { title: 'Table 表格', link: '/components/table' },
          ],
        },
        {
          title: 'Table Hooks',
          children: [
            { title: 'useTableDIY', link: '/components/use-table-diy' },
            { title: 'useTableSelection', link: '/components/use-table-selection' },
            { title: 'useTableVirtual', link: '/components/use-table-virtual' },
            { title: 'useTableResizable', link: '/components/use-table-resizable' },
            { title: 'useTableTheme', link: '/components/use-table-theme' },
            { title: 'useTableExpandable', link: '/components/use-table-expandable' },
          ],
        },
      ],
    },
  },
});
