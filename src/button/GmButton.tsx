import React, { useCallback, useRef, useState } from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import { secondButtonStyle, secondButtonDisabledHoverStyle, secondButtonDisabledStyle, secondButtonHoverStyle } from './styles';

export type ButtonType = AntButtonProps['type'] | 'second';

export interface GmButtonProps extends Omit<AntButtonProps, 'type'> {
  type?: ButtonType;
}

const GmButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, GmButtonProps>(
  ({ type = 'second', onClick, disabled, style, className, ...rest }, ref) => {
    const [autoLoading, setAutoLoading] = useState(false);
    const loadingRef = useRef(false);

    const isSecond = type === 'second';
    const antType = isSecond ? 'default' : type;
    const finalLoading = rest.loading || autoLoading;

    const getSecondStyle = useCallback((): React.CSSProperties => {
      if (!isSecond) return style as React.CSSProperties;

      const base: React.CSSProperties = { ...secondButtonStyle };
      if (finalLoading) {
        return { ...base, ...style };
      }
      if (disabled) {
        return { ...base, ...secondButtonStyle, ...secondButtonDisabledStyle, ...style };
      }
      return { ...base, ...style };
    }, [isSecond, disabled, finalLoading, style]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (autoLoading || loadingRef.current) {
          e.preventDefault();
          return;
        }

        if (onClick) {
          const result = (onClick as (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => any)(e);
          if (result && typeof result.then === 'function') {
            loadingRef.current = true;
            setAutoLoading(true);
            result.finally(() => {
              setAutoLoading(false);
              loadingRef.current = false;
            });
          }
        }
      },
      [onClick, autoLoading],
    );

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
          if (isSecond && disabled) {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              secondButtonDisabledHoverStyle.backgroundColor!;
          }
          rest.onMouseLeave?.(e);
        }}
      />
    );
  },
);

GmButton.displayName = 'GmButton';

export default GmButton;
