// components/Text.tsx
import React from 'react';
import clsx from 'clsx';

type Variant =
  | 'title'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'body'
  | 'tiny'
  | 'intro'
  | 'subtitle';

interface TextProps {
  children: React.ReactNode;
  variant?: Variant;
  as?: keyof JSX.IntrinsicElements;
  lineHeight?: string;
  fontSize?: string;
  fontWeight?: string;
  underline?: boolean;
  padding?: string;
  margin?: string;
  noMarginBottom?: boolean;
  noMargin?: boolean;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  title: 'text-3xl font-semibold',
  h2: 'text-2xl font-semibold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  h5: 'text-base font-semibold',
  body: 'text-base font-light',
  tiny: 'text-[0.7em] font-light',
  intro: 'text-xl font-light',
  subtitle: 'text-lg font-light text-gray-500',
};

const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  as: Component = 'p',
  lineHeight,
  fontSize,
  fontWeight,
  underline = false,
  padding,
  margin,
  noMarginBottom = false,
  noMargin = false,
  className,
}) => {
  const marginClasses = margin
  ? margin
  : noMargin
  ? 'm-0'
  : noMarginBottom
  ? 'mt-[1em] mb-0'
  : 'my-[1em]';

  const classes = clsx(
    variantClasses[variant],
    underline && 'underline',
    padding && padding,
    marginClasses,
    lineHeight && `leading-[${lineHeight}]`,
    fontSize && `text-[${fontSize}]`,
    fontWeight && `font-${fontWeight}`,
    className
  );

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
};

export default Text;
