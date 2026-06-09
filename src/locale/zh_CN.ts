import zhCN from 'antd/es/locale/zh_CN';
import type { Locale } from 'antd/es/locale';

/**
 * GM-enhanced Chinese (zh-CN) locale.
 * Extends antd 5's zhCN with custom fields used by GM components:
 *   - Table: header settings, filter labels, selection helpers
 *   - TableFilter: quick date-range presets
 *   - Upload: local upload, file size, drag-and-drop labels
 */
const gmLocale = {
  ...zhCN,
  Table: {
    ...zhCN.Table,
    // GM custom fields beyond standard antd
    filterCheckall: '全选',
    selectAllPages: '全选所有页',
    headerSettings: '表头设置',
    optionalField: '可选字段',
    defaultGrouping: '默认分组',
    theCurrentlySelectedField: '当前选定字段',
    cancel: '取消',
    save: '保存',
    selected: '已选',
    project: '项目',
    open: '展开',
    close: '收起',
    search: '查询',
    pleaseSelect: '请选择',
    pleaseEnter: '请输入',
    allFilteringCriteria: '全部筛选条件',
    saveSettings: '保存设置',
    items: '个条目',
  },
  TableFilter: {
    today: '今天',
    yesterday: '昨天',
    last7days: '近7天',
    last30Days: '近30天',
  },
  Upload: {
    ...zhCN.Upload,
    uploadLocalFile: '上传本地文件',
    noFilesUploaded: '未上传任何文件',
    theFileCannotBeLargerThan10MB: '文件不能大于10MB',
    uploadSuccessful: '上传成功',
    submit: '提交',
    clickOrDragTheFileHereToUpload: '点击或将文件拖拽到这里上传',
    supportExtensions: '支持扩展名: ',
  },
} as Locale & {
  TableFilter: Record<string, string>;
  Table: Locale['Table'] & Record<string, string>;
  Upload: Locale['Upload'] & Record<string, string>;
};

export default gmLocale;
