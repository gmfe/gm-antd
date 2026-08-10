import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { InboxOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';
import { ConfigProvider, Modal, Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import zhCN from '../locale/zh_CN';

export interface UploadOpenProps {
  title?: string;
  /** 文件类型,例如 '.doc,.docx' / '.xlsx, .xls, .pdf' */
  accept?: string;
  multiple?: boolean;
  /** 单个文件大小上限(MB) */
  maxSize?: number;
  /** 自定义上传,需返回文件可访问 url */
  uploadFn: (file: File) => Promise<{ data: { url: string } }>;
}

interface UploadOpenModalProps extends UploadOpenProps {
  onResolve: (files: UploadFile[]) => void;
  onClose: () => void;
}

/**
 * 命令式上传弹窗的内部组件。
 *
 * 背景旧 gm-pc 时代提供了 Upload.open({...}).then(files => ...) 命令式 API,
 * 升级 antd5 后原生 Upload 不再带该方法。这里用 createRoot 独立渲染一个
 * 受控 Modal, 恢复同等行为。相比 legacy 的 Modal.info(visibility:hidden) 挂载 hack,
 * 独立 root 避免 antd5 嵌套 Modal 的可见性继承陷阱,更可靠。
 */
const UploadOpenModal: React.FC<UploadOpenModalProps> = ({
  title = '上传本地文件',
  accept,
  multiple = false,
  maxSize = 10,
  uploadFn,
  onResolve,
  onClose,
}) => {
  const [open, setOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // 闭包陷阱: beforeUpload 内的异步回调读取最新列表
  const liveFileList = useRef<UploadFile[]>([]);

  const close = () => {
    setOpen(false);
    onClose();
  };

  const handleOk = () => {
    if (uploading || !fileList.length) {
      message.warning('请先上传文件');
      return;
    }
    onResolve(fileList.filter((f) => f.status === 'done'));
    close();
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple,
    accept,
    fileList,
    onRemove(file) {
      const index = fileList.indexOf(file);
      const next = fileList.slice();
      next.splice(index, 1);
      setFileList(next);
      liveFileList.current = next;
    },
    beforeUpload(file) {
      const size = (file as File).size / 1024 / 1024;
      if (size > maxSize) {
        message.error(`文件大小不能超过 ${maxSize}MB`);
        return false;
      }
      (file as UploadFile).status = 'uploading';
      let next: UploadFile[] = [...liveFileList.current, file];
      if (!multiple) next = [file];
      setUploading(true);
      setFileList(next);
      liveFileList.current = next;
      uploadFn(file as File)
        .then(({ data: { url } }) => {
          next = cloneDeep(liveFileList.current);
          const item = next.find((f) => f.uid === file.uid);
          if (item) {
            item.status = 'done';
            item.url = url;
          }
          setFileList(next);
        })
        .finally(() => setUploading(false));
      // 返回 false 阻止 antd 自动上传, 由 uploadFn 接管
      return false;
    },
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={close}
      destroyOnHidden
      width={600}
      okText='提交'
      okButtonProps={{ disabled: uploading }}
    >
      <div style={{ padding: '0 30px' }}>
        <Upload.Dragger {...uploadProps}>
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text' style={{ fontWeight: 'bold' }}>
            点击或将文件拖拽到此区域上传
          </p>
          {accept && <p className='ant-upload-hint'>支持扩展名: {accept}</p>}
        </Upload.Dragger>
      </div>
    </Modal>
  );
};

/**
 * 命令式打开上传文件弹窗,兼容旧 gm-pc `Upload.open` API。
 *
 *     Upload.open({ accept: '.xlsx', uploadFn }).then(files => {
 *       console.log(files[0].url)
 *     })
 *
 * 点击取消时 Promise 不会 resolve(与旧行为一致)。
 */
export function open(
  props: UploadOpenProps,
): Promise<Array<UploadFile & { url: string }>> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      // 等 Modal 关闭动画(约 300ms)结束后再卸载, 避免动画中断闪烁
      window.setTimeout(() => {
        root.unmount();
        container.remove();
      }, 350);
    };
    root.render(
      <ConfigProvider locale={zhCN}>
        <UploadOpenModal
          {...props}
          onResolve={(files) =>
            resolve(files.filter((f) => !!f.url) as Array<UploadFile & { url: string }>)
          }
          onClose={cleanup}
        />
      </ConfigProvider>,
    );
  });
}

// 给 antd5 原生 Upload 挂上 .open, 恢复 gm-pc 旧 API。
// 显式 export 覆盖 src/index.ts 中 `export * from 'antd'` 的原生 Upload。
const EnhancedUpload = Upload as typeof Upload & { open: typeof open };
EnhancedUpload.open = open;

export { EnhancedUpload as Upload };
