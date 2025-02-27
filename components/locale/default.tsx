/* eslint-disable no-template-curly-in-string */
import Pagination from 'rc-pagination/lib/locale/en_US';
import Calendar from '../calendar/locale/en_US';
import DatePicker from '../date-picker/locale/en_US';
import type { Locale } from '../locale-provider';
import TimePicker from '../time-picker/locale/en_US';

const typeTemplate = '${label} is not a valid ${type}';

const localeValues: Locale = {
  locale: 'en',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: 'Please select',
  },
  Table: {
    filterTitle: 'Filter menu',
    filterConfirm: 'OK',
    filterReset: 'Reset',
    filterEmptyText: 'No filters',
    filterCheckall: 'Select all items',
    filterSearchPlaceholder: 'Search in filters',
    emptyText: 'No data',
    selectAll: 'Select current page',
    selectInvert: 'Invert current page',
    selectNone: 'Clear all data',
    selectionAll: 'Select all data',
    sortTitle: 'Sort',
    expand: 'Expand row',
    collapse: 'Collapse row',
    triggerDesc: 'Click to sort descending',
    triggerAsc: 'Click to sort ascending',
    cancelSort: 'Click to cancel sorting',
    headerSettings: 'Header settings',
    optionalField: 'Optional field',
    defaultGrouping: 'Default grouping',
    theCurrentlySelectedField: 'The currently selected field',
    cancel: 'Cancel',
    save: 'Save',
    selectAllPages: 'Select all data',
    selected: 'Selected',
    project: 'project',
    open: 'Open',
    close: 'Close',
    search: 'Search',
    pleaseSelect: 'Please select ',
    pleaseEnter: 'Please enter ',
    allFilteringCriteria: 'All filtering criteria',
    saveSettings: 'Save settings',
    items: ' items',
  },
  Modal: {
    okText: 'OK',
    cancelText: 'Cancel',
    justOkText: 'OK',
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'Cancel',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Search here',
    itemUnit: 'item',
    itemsUnit: 'items',
    remove: 'Remove',
    selectCurrent: 'Select current page',
    removeCurrent: 'Remove current page',
    selectAll: 'Select all data',
    removeAll: 'Remove all data',
    selectInvert: 'Invert current page',
  },
  Upload: {
    uploading: 'Uploading...',
    removeFile: 'Remove file',
    uploadError: 'Upload error',
    previewFile: 'Preview file',
    downloadFile: 'Download file',
    uploadLocalFile: 'Upload local file',
    noFilesUploaded: 'No files uploaded',
    theFileCannotBeLargerThan10MB: 'The file cannot be larger than 10 MB',
    uploadSuccessful: 'Upload successful',
    submit: 'Submit',
    clickOrDragTheFileHereToUpload: 'Click or drag the file here to upload',
    supportExtensions: 'Support extensions:',
  },
  Empty: {
    description: 'No data',
  },
  Icon: {
    icon: 'icon',
  },
  Text: {
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied',
    expand: 'Expand',
  },
  PageHeader: {
    back: 'Back',
  },
  Form: {
    optional: '(optional)',
    defaultValidateMessages: {
      default: 'Field validation error for ${label}',
      required: 'Please enter ${label}',
      enum: '${label} must be one of [${enum}]',
      whitespace: '${label} cannot be a blank character',
      date: {
        format: '${label} date format is invalid',
        parse: '${label} cannot be converted to a date',
        invalid: '${label} is an invalid date',
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
        len: '${label} must be ${len} characters',
        min: '${label} must be at least ${min} characters',
        max: '${label} must be up to ${max} characters',
        range: '${label} must be between ${min}-${max} characters',
      },
      number: {
        len: '${label} must be equal to ${len}',
        min: '${label} must be minimum ${min}',
        max: '${label} must be maximum ${max}',
        range: '${label} must be between ${min}-${max}',
      },
      array: {
        len: 'Must be ${len} ${label}',
        min: 'At least ${min} ${label}',
        max: 'At most ${max} ${label}',
        range: 'The amount of ${label} must be between ${min}-${max}',
      },
      pattern: {
        mismatch: '${label} does not match the pattern ${pattern}',
      },
    },
  },
  Image: {
    preview: 'Preview',
  },
  TableFilter: {
    today: 'Today',
    yesterday: 'Yesterday',
    last7days: 'Last 7 days',
    last30Days: 'Last 30 days',
  },
};

export default localeValues;
