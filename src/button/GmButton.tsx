import React, { useRef, useState } from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import { secondButtonStyle, secondButtonDisabledStyle, secondButtonHoverStyle } from './styles';

export type ButtonType = AntButtonProps['type'] | 'second';

/** 防连点时间窗间隔: 人类双击间隔通常 <250ms, 正常连续操作 300ms+ */
const THROTTLE_MS = 300;

export interface GmButtonProps extends Omit<AntButtonProps, 'type'> {
  type?: ButtonType;
  /**
   * 防连点时间窗(默认开启): 300ms 内同一按钮只放行首次点击, 后续点击忽略。
   * 与 autoLoading 互补 —— 时间窗不依赖 onClick 写法, 同步 handler / fire-and-forget
   * 的快速双击也能拦截; 确实需要 <300ms 连续响应的场景传 false 关闭。
   */
  throttle?: boolean;
}

const GmButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, GmButtonProps>(
  ({ type = 'second', onClick, disabled, throttle = true, style, className, ...rest }, ref) => {
    const [autoLoading, setAutoLoading] = useState(false);
    const loadingRef = useRef(false);
    const lastClickRef = useRef(0);

    const isSecond = type === 'second';
    const antType = isSecond ? 'default' : type;
    const finalLoading = rest.loading || autoLoading;

    const getSecondStyle = (): React.CSSProperties => {
      if (!isSecond) return style as React.CSSProperties;

      const base: React.CSSProperties = { ...secondButtonStyle };
      if (finalLoading) {
        return { ...base, ...style };
      }
      if (disabled) {
        return { ...base, ...secondButtonStyle, ...secondButtonDisabledStyle, ...style };
      }
      return { ...base, ...style };
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      // 防连点时间窗: ref 同步判定, 双击第二击必然被拦(不依赖 React 重渲染时机)
      const now = Date.now();
      if (throttle && now - lastClickRef.current < THROTTLE_MS) {
        e.preventDefault();
        return;
      }
      lastClickRef.current = now;

      if (autoLoading || loadingRef.current) {
        e.preventDefault();
        return;
      }

      if (onClick) {
        const result = (onClick as (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => any)(e);
        if (result && typeof result.then === 'function') {
          loadingRef.current = true;
          setAutoLoading(true);
          // P0 修复: 直接调 result.finally 在非原生 thenable(如 mobx flow 返回值、
          // 自定义 promise-like)上会抛 "finally is not a function" —— 且异常发生在
          // loading 锁定之后, 没有任何解锁路径, 按钮永久锁死。
          // Promise.resolve 把 thenable 归一为原生 Promise, .finally 必然存在。
          Promise.resolve(result).finally(() => {
            setAutoLoading(false);
            loadingRef.current = false;
          });
        }
      }
    };

    return (
      <AntButton
        {...rest}
        ref={ref as React.Ref<HTMLButtonElement>}
        type={antType}
        loading={finalLoading}
        disabled={disabled}
        onClick={handleClick}
        style={getSecondStyle()}
        className={className}
        onMouseEnter={(e) => {
          if (isSecond && !disabled && !finalLoading) {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              secondButtonHoverStyle.backgroundColor!;
          }
          rest.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (isSecond && !disabled && !finalLoading) {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              secondButtonStyle.backgroundColor!;
          }
          // disabled 的 second 按钮不在此处改背景: 之前会把 bg 设成 transparent,
          // 导致"禁用按钮 hover 后背景消失"。disabled 应保持 #f5f5f5 禁用底色。
          rest.onMouseLeave?.(e);
        }}
      />
    );
  },
);

GmButton.displayName = 'GmButton';

export default GmButton;
