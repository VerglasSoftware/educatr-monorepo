import React from 'react';
import clsx from 'clsx';

type Variant = 'educatr' | 'verglas';

interface LogoProps {
  variant: Variant;
  solid?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant, solid = false, className }) => {
  const logoSrc: Record<Variant, string> = {
    educatr: solid
      ? '/resources/images/logo/educatr_solid.png' 
      : '/resources/images/logo/educatr.png',
    verglas: solid
      ? '/resources/images/logo/verglas_solid.png'
      : '/resources/images/logo/verglas.png',
  };

  return (
    <div className={clsx('inline-block h-full', className)}>
      <img
        src={logoSrc[variant]}
        alt={`${variant} logo`}
        className="h-full w-auto object-contain"
      />
    </div>
  );
};

export default Logo;
