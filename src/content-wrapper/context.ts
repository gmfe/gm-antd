import { createContext } from 'react'

export interface ContentWrapperContextProps {
  /** 容器元素 */
  container: HTMLElement
  /** 容器宽度 */
  width: number
  /** 容器高度 */
  height: number
  /** 滚动条是否在显示 */
  scrollbar: boolean
  /** 显示滚动条 */
  showScrollBar: () => void
  /** 隐藏滚动条 */
  hideScrollBar: () => void
  /** 滚动条距离顶部距离 */
  scrollTop: number
  /** 滚动条距离底部距离 */
  scrollBottom: number
  /** 是否已滚动到底部 */
  atBottom?: boolean
}

const ContentWrapperContext = createContext<ContentWrapperContextProps>(
  {} as any,
)

export default ContentWrapperContext
