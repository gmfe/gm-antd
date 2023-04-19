import classNames from 'classnames';
import type { CSSProperties, FC, HTMLAttributes, ReactNode } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ResizeObserver from 'rc-resize-observer';
import { Divider } from '../index';
import ContentWrapperContext from './context';
import type { ContentWrapperContextProps } from './context';
import './index.less';

export interface ContentWrapperProps extends HTMLAttributes<HTMLDivElement> {
  /** 滚到底部时隐藏滚动条 */
  hideScrollbarAtBottom?: boolean;
  /** 左侧栏插槽，实现双栏布局的列表页 */
  left?: ReactNode;
  /** Left宽度，默认25% */
  leftWidth?: CSSProperties['width'];
  /** 头部插槽 */
  top?: ReactNode;
  /** 底部固定插槽，保存、取消之类的动作 */
  bottom?: ReactNode;
  /** Scroll事件频率过高会产生性能、体验的流畅问题，通过此项禁用scroll监听来提升丝滑感，同时context中的scroll也数值也不再更新 */
  smooth?: boolean;
}

const Gap = () => (
  <div
    className="content-wrapper-gap"
    style={{
      height: 16,
      width: 'calc(100% + 40px)',
      marginLeft: -15,
    }}
  />
);

/** 页面内容块（gm-framework-content）裹壳 */
const Component: FC<ContentWrapperProps> = ({
  className,
  style,
  children,
  left,
  leftWidth = '25%',
  top,
  bottom,
  hideScrollbarAtBottom,
  smooth,
}) => {
  const ref = useRef(document.createElement('div'));
  const bottomFlagRef = useRef(document.createElement('div'));
  const [state, setState] = useState<ContentWrapperContextProps>({
    width: 0,
    height: 0,
    container: undefined as any as HTMLElement,
    scrollTop: 0,
    scrollBottom: -1,
    scrollbar: true,
    atBottom: false,
    showScrollBar() {
      setState(state => ({ ...state, scrollbar: true }));
    },
    hideScrollBar() {
      setState(state => ({ ...state, scrollbar: false }));
    },
  });
  const context = useContext(ContentWrapperContext);
  const hasContext = !!Object.keys(context).length;

  useEffect(() => {
    setState(state => ({ ...state, container: ref.current! }));
    // eslint-disable-next-line compat/compat
    const observer = new IntersectionObserver(
      entries => {
        setState(state => ({ ...state, atBottom: entries[0].isIntersecting }));
      },
      {
        root: ref.current,
        threshold: 1.0,
      },
    );
    observer.observe(bottomFlagRef.current!);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hideScrollbarAtBottom) return;
    if (state.scrollTop && !state.scrollBottom) {
      state.hideScrollBar();
    } else {
      state.showScrollBar();
    }
  }, [state.scrollTop, state.scrollBottom]);

  useEffect(() => {
    if (smooth) return;
    let id = -1;
    const onScroll = () => {
      const el = ref.current;
      if (!el) {
        id = requestAnimationFrame(onScroll);
        return;
      }
      setState(state => {
        const { height } = el.getBoundingClientRect();
        let scrollBottom = el.scrollHeight - (el.scrollTop + height) - (bottom ? 64 : 0);
        // 向下滑 // windows上抽风
        scrollBottom = scrollBottom <= 1.5 ? 0 : scrollBottom;
        const { scrollTop } = el;
        if (scrollTop === state.scrollTop && scrollBottom === state.scrollBottom) {
          return state;
        }
        return {
          ...state,
          scrollTop: el.scrollTop,
          scrollBottom,
        };
      });
      // if (!hideScrollbarAtBottom) return
      id = requestAnimationFrame(onScroll);
    };
    id = requestAnimationFrame(onScroll);
    return () => {
      cancelAnimationFrame(id);
    };
  }, [smooth]);

  // ContentWrapper内嵌ContentWrapper无效
  if (hasContext) {
    return <>{children}</>;
  }

  return (
    <ContentWrapperContext.Provider value={state}>
      <div
        className={classNames('content-wrapper', className)}
        style={{
          ...style,
          // tw-relative tw-p-3
          position: 'relative',
          padding: 15,
        }}
      >
        <div
          ref={ref}
          className={classNames('content-wrapper-viewbox', { 'hide-scrollbar': !state.scrollbar })}
          style={{
            paddingBottom: bottom ? 64 : 0,
            paddingLeft: left ? leftWidth : 0,
            //  tw-overflow-y-auto tw-overflow-x-hidden tw-h-full tw-rounded
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            borderRadius: 4,
          }}
        >
          <ResizeObserver
            onResize={({ height }) =>
              setState(state => {
                height = height * 2 - (bottom ? 64 : 0) - 15 * 2; // 减去上边距15
                return { ...state, height };
              })
            }
          >
            <div
              // className="tw-absolute tw-z-0 tw-h-1/2 tw-pointer-events-none tw-opacity-0"
              style={{
                position: 'absolute',
                zIndex: 0,
                height: '50%',
                pointerEvents: 'none',
                opacity: 0,
              }}
            />
          </ResizeObserver>
          {top && (
            <>
              <div
                // className="tw-rounded tw-bg-white tw-px-3 tw-sticky tw-top-0 tw-z-[500]"
                style={{
                  borderRadius: 4,
                  backgroundColor: '#fff',
                  padding: '0 15px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 500,
                }}
              >
                {top}
              </div>
              <Gap />
            </>
          )}
          {children && (
            <>
              <div
                // className="tw-rounded tw-bg-white tw-px-3 tw-min-h-full"
                style={{
                  borderRadius: 4,
                  backgroundColor: '#fff',
                  padding: '0 15px',
                  minHeight: '100%',
                }}
              >
                {children}
                <div
                  // className="tw-relative"
                  style={{
                    position: 'relative',
                  }}
                >
                  <ResizeObserver
                    onResize={({ width }) =>
                      setState(state => {
                        width *= 2;
                        return { ...state, width };
                      })
                    }
                  >
                    <div
                      // className="tw-absolute tw-z-0 tw-w-1/2 tw-pointer-events-none tw-opacity-0"
                      style={{
                        position: 'absolute',
                        zIndex: 0,
                        width: '50%',
                        pointerEvents: 'none',
                        opacity: 0,
                      }}
                    />
                  </ResizeObserver>
                </div>
              </div>
            </>
          )}
          {left && (
            <div
              className="content-wrapper-viewbox-left"
              style={{
                width: leftWidth,
                // tw-absolute tw-top-0 tw-left-0 tw-pl-3 tw-pt-3 tw-h-full
                position: 'absolute',
                top: 0,
                paddingLeft: 15,
                paddingTop: 15,
                height: '100%',
              }}
            >
              <div
                // className="tw-rounded tw-bg-white tw-h-full tw-p-2 tw-h-full tw-overflow-y-auto"
                style={{
                  borderRadius: 4,
                  backgroundColor: '#fff',
                  padding: 10,
                  height: '100%',
                  overflowY: 'auto',
                }}
              >
                {left}
              </div>
            </div>
          )}
          {bottom && (
            <div
              className="content-wrapper-viewbox-bottom"
              // tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-pl-3.5 tw-pr-5 tw-z-10
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                paddingLeft: 18,
                paddingRight: 25,
                zIndex: 10,
              }}
            >
              <Divider
                // className="tw-w-full tw-m-0"
                style={{
                  width: '100%',
                  margin: 0,
                }}
              />
              <div
                // className="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-3 tw-bg-white "
                style={{
                  height: 64,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 15,
                  backgroundColor: '#fff',
                }}
              >
                {bottom}
              </div>
            </div>
          )}
          {/* 用于计算底部可见 */}
          <div ref={bottomFlagRef} />
        </div>
      </div>
    </ContentWrapperContext.Provider>
  );
};

// eslint-disable-next-line compat/compat
const ContentWrapper = Object.assign(Component, { Gap });
export default ContentWrapper;
