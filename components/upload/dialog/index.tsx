/* eslint-disable camelcase */
import type { HTMLAttributes, ReactNode } from 'react';
import React, {
  cloneElement,
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';
import locale from '../../locale/zh_CN';
import { ConfigProvider, message, Modal, Upload } from '../../index';
import type { UploadFile as UploadFileType, UploadProps } from '../../index';

export interface UploadFileProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  onReady?: () => void;
  onOK?: (fileList: UploadFileType[]) => void;
  title?: string;
  /**
   * 文件类型
   *
   * - '.doc,.docx'
   * - '.xlsx, .xls, .csv'
   */
  accept: string;
  /** 拖拽框下方的插槽 */
  extra?: ReactNode;
  /** 10M */
  maxSize?: 10;
  multiple?: boolean;
  uploadFn: (file: File) => Promise<{ data: { url: string } }>;
}

const initialState = {
  show: false,
  uploading: false,
  fileList: [] as UploadFileType[],
};

export interface UploadFileMethods {
  state: typeof initialState;
  open: ({ id }?: { id?: string }) => void;
  close: () => void;
  onOK: () => void;
}

/** 两种使用方式： 1、传入ref到此组件并挂载后通过ref来handle显示/隐藏 2、直接调用组件的.open().then((handler) => {})方法显示 */
const Component = forwardRef<UploadFileMethods, UploadFileProps>(
  (
    {
      onReady,
      onClose,
      onOK,
      title = '上传本地文件',
      accept,
      extra,
      maxSize = 10,
      multiple = false,
      uploadFn,
    },
    ref,
  ) => {
    const [state, assignState] = useReducer(
      (state: typeof initialState, data: Partial<typeof initialState>) => {
        const res = {
          ...state,
          ...data,
        };
        return res;
      },
      initialState,
    );

    const { show, uploading, fileList } = state;

    // 闭包陷阱临时方案
    const liveFileList = useRef([] as UploadFileType[]);

    const methods: UploadFileMethods = {
      state,
      open() {
        assignState({ show: true });
      },
      close() {
        assignState({ show: false });
        onClose && setTimeout(onClose, 500);
      },
      onOK() {
        if (uploading || !fileList.length) {
          message.warn('未上传任何文件');
          return;
        }
        assignState({ show: false });
        onOK && onOK(fileList);
        methods.close();
      },
    };

    useImperativeHandle(ref, () => methods, [state]);
    useEffect(() => {
      if (onReady) onReady();
    }, []);

    const props: UploadProps = {
      name: 'file',
      multiple,
      // showUploadList: false,
      accept,
      fileList,
      onRemove(file) {
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        assignState({ fileList: newFileList });
      },
      beforeUpload(file) {
        const size = (file as File).size / 1024 / 1024;
        if (size > maxSize) {
          message.error('文件不能大于10MB');
          return false;
        }
        // compressImg(file as File, 3182, 2160)
        (file as UploadFileType).status = 'uploading';
        let newFileList: UploadFileType[] = [...liveFileList.current, file];
        if (!multiple) newFileList = [file];
        assignState({ uploading: true, fileList: newFileList });
        liveFileList.current = newFileList;
        uploadFn(file as File)
          .then(({ data: { url } }) => {
            newFileList = cloneDeep(liveFileList.current);
            const item = newFileList.find(f => f.uid === file.uid)!;
            item.status = 'done';
            item.url = url;
            assignState({ fileList: newFileList });
          })
          .finally(() => {
            assignState({ uploading: false });
          });
        return false;
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      itemRender(node, file) {
        return (
          <div
            // className={classNames('tw-relative', {})}
            style={{ position: 'relative' }}
          >
            {cloneElement(node, { style: { width: '75%' } })}
            {file.status === 'done' && (
              <span
                // className="tw-absolute tw-right-6 tw-top-0.5 tw-text-sm tw-pointer-events-none"
                style={{
                  position: 'absolute',
                  right: 30,
                  top: 2,
                  fontSize: 14,
                  pointerEvents: 'none',
                }}
              >
                上传成功
              </span>
            )}
          </div>
        );
      },
    };

    return (
      <Modal
        title={title}
        open={show}
        onOk={methods.onOK}
        onCancel={methods.close}
        destroyOnClose
        bodyStyle={{ maxHeight: '75vh', overflow: 'auto' }}
        width={600}
        cancelButtonProps={{ type: 'second' }}
        okText="提交"
        okButtonProps={{
          disabled: uploading, // || !fileList.length,
        }}
      >
        <div
          // className="tw-px-6"
          style={{
            padding: '0 30px',
          }}
        >
          <Upload.Dragger height={200} {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text " style={{ fontWeight: 'bold' }}>
              点击或将文件拖拽到这里上传
            </p>
            <p className="ant-upload-hint">支持扩展名: {accept}</p>
          </Upload.Dragger>
          <div
            // className="tw-h-3"
            style={{
              height: 15,
            }}
          />
          {extra}
        </div>
      </Modal>
    );
  },
);

async function open(
  props: Omit<
    UploadFileProps,
    'onOK' | 'onClose' | 'onReady' | keyof Omit<HTMLAttributes<HTMLDivElement>, 'title'>
  >,
) {
  return new Promise<Array<UploadFileType & { url: string }>>(resolve => {
    const handler = createRef<UploadFileMethods>();
    const { destroy } = Modal.info({
      style: { visibility: 'hidden' },
      mask: false,
      content: (
        <ConfigProvider locale={locale}>
          <Component
            ref={handler}
            onReady={() => {
              handler.current?.open();
            }}
            onOK={files => {
              resolve(files as Array<UploadFileType & { url: string }>);
            }}
            onClose={() => destroy()}
            {...props}
          />
        </ConfigProvider>
      ),
    });
  });
}

/**
 * 上传本地文件的通用弹框，适用于“从本地导入”等场景
 *
 *     UploadFile.open({...}).then(files => {
 *       console.log(files[0].url)
 *     })
 */
// eslint-disable-next-line compat/compat
const UploadFile = Object.assign(Component, { open });
export default UploadFile;
