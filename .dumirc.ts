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
            { title: 'TimePicker 时间选择框', link: '/components/time-picker' },
          ],
        },
        {
          title: '布局',
          children: [
            { title: 'ContentWrapper', link: '/components/content-wrapper' },
          ],
        },
        {
          title: '兼容垫片(antd4→5)',
          children: [
            { title: 'Modal 对话框', link: '/components/modal' },
            { title: 'Drawer 抽屉', link: '/components/drawer' },
            { title: 'Tooltip 文字提示', link: '/components/tooltip' },
            { title: 'Popover 气泡卡片', link: '/components/popover' },
            { title: 'Dropdown 下拉菜单', link: '/components/dropdown' },
            { title: 'Popconfirm 气泡确认框', link: '/components/popconfirm' },
            { title: 'Input 输入框', link: '/components/input' },
            { title: 'InputNumber 数字输入框', link: '/components/input-number' },
            { title: 'Cascader 级联选择', link: '/components/cascader' },
            { title: 'TreeSelect 树选择', link: '/components/tree-select' },
            { title: 'AutoComplete 自动完成', link: '/components/auto-complete' },
            { title: 'Mentions 提及', link: '/components/mentions' },
            { title: 'Tabs 标签页', link: '/components/tabs' },
            { title: 'Menu 导航菜单', link: '/components/menu' },
            { title: 'message 全局提示', link: '/components/message' },
            { title: 'DatePicker 日期选择框', link: '/components/date-picker' },
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
