/* eslint-disable no-template-curly-in-string */
import Pagination from 'rc-pagination/lib/locale/zh_CN';
import Calendar from '../calendar/locale/zh_CN';
import DatePicker from '../date-picker/locale/zh_CN';
import type { Locale } from '../locale-provider';
import TimePicker from '../time-picker/locale/zh_CN';

const typeTemplate = '${label}不是一个有效的${type}';

const localeValues: Locale = {
  locale: 'zh-cn',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  // locales for all components
  global: {
    placeholder: '请选择',
  },
  Table: {
    filterTitle: '筛选',
    filterConfirm: '确定',
    filterReset: '重置',
    filterEmptyText: '无筛选项',
    filterCheckall: '全选',
    filterSearchPlaceholder: '在筛选项中搜索',
    selectAll: '全选当页',
    selectInvert: '反选当页',
    selectNone: '清空所有',
    selectionAll: '全选所有',
    sortTitle: '排序',
    expand: '展开行',
    collapse: '关闭行',
    triggerDesc: '点击降序',
    triggerAsc: '点击升序',
    cancelSort: '取消排序',
    headerSettings: '表头设置',
    optionalField: '可选字段',
    defaultGrouping: '默认分组',
    theCurrentlySelectedField: '当前选定字段',
    cancel: '取消',
    save: '保存',
    selectAllPages: '全选所有页',
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
  Modal: {
    okText: '确定',
    cancelText: '取消',
    justOkText: '知道了',
  },
  Popconfirm: {
    cancelText: '取消',
    okText: '确定',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: '请输入搜索内容',
    itemUnit: '项',
    itemsUnit: '项',
    remove: '删除',
    selectCurrent: '全选当页',
    removeCurrent: '删除当页',
    selectAll: '全选所有',
    removeAll: '删除全部',
    selectInvert: '反选当页',
  },
  Upload: {
    uploading: '文件上传中',
    removeFile: '删除文件',
    uploadError: '上传错误',
    previewFile: '预览文件',
    downloadFile: '下载文件',
    uploadLocalFile: '上传本地文件',
    noFilesUploaded: '未上传任何文件',
    theFileCannotBeLargerThan10MB: '文件不能大于10MB',
    uploadSuccessful: '上传成功',
    submit: '提交',
    clickOrDragTheFileHereToUpload: '点击或将文件拖拽到这里上传',
    supportExtensions: '支持扩展名: ',
  },
  Empty: {
    description: '暂无数据',
  },
  Icon: {
    icon: '图标',
  },
  Text: {
    edit: '编辑',
    copy: '复制',
    copied: '复制成功',
    expand: '展开',
  },
  PageHeader: {
    back: '返回',
  },
  Form: {
    optional: '（可选）',
    defaultValidateMessages: {
      default: '字段验证错误${label}',
      required: '请输入${label}',
      enum: '${label}必须是其中一个[${enum}]',
      whitespace: '${label}不能为空字符',
      date: {
        format: '${label}日期格式无效',
        parse: '${label}不能转换为日期',
        invalid: '${label}是一个无效日期',
      },
      types: {
        string: typeTemplate,
        method: typeTemplate,
        array: typeTemplate,
        object: typeTemplate,
        number: typeTemplate,
        date: typeTemplate,
        boolean: typeTemplate,
        integer: typeTemplate,
        float: typeTemplate,
        regexp: typeTemplate,
        email: typeTemplate,
        url: typeTemplate,
        hex: typeTemplate,
      },
      string: {
        len: '${label}须为${len}个字符',
        min: '${label}最少${min}个字符',
        max: '${label}最多${max}个字符',
        range: '${label}须在${min}-${max}字符之间',
      },
      number: {
        len: '${label}必须等于${len}',
        min: '${label}最小值为${min}',
        max: '${label}最大值为${max}',
        range: '${label}须在${min}-${max}之间',
      },
      array: {
        len: '须为${len}个${label}',
        min: '最少${min}个${label}',
        max: '最多${max}个${label}',
        range: '${label}数量须在${min}-${max}之间',
      },
      pattern: {
        mismatch: '${label}与模式不匹配${pattern}',
      },
    },
  },
  Image: {
    preview: '预览',
  },
  TableFilter: {
    today: '今天',
    yesterday: '昨天',
    last7days: '近7天',
    last30Days: '近30天',
  },
};

export default localeValues;
