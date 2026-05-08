import { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: 'fade' | 'slide-up' | 'scale' | 'bounce';
}

const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
  type = 'slide-up',
}: AnimatedSectionProps) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  const getAnimationClass = () => {
    if (!isIntersecting) return 'opacity-0';
    switch (type) {
      case 'fade':
        return 'fade-in';
      case 'slide-up':
        return 'slide-up';
      case 'scale':
        return 'scale-in';
      case 'bounce':
        return 'bounce-in';
      default:
        return 'slide-up';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${getAnimationClass()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
