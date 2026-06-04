import { motion } from 'framer-motion';
import { FiArrowRight, FiShoppingCart, FiMessageCircle, FiPhone } from 'react-icons/fi';

/**
 * Call-to-Action Button Components
 * Optimized for conversion with psychological triggers
 */

// Primary CTA Button
export const CTAButton = ({
  children,
  onClick,
  href,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'whatsapp'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'right', // 'left' | 'right'
  fullWidth = false,
  loading = false,
  disabled = false,
  urgency = false, // Add urgency indicator
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-chocolate to-caramel text-white hover:shadow-2xl hover:shadow-chocolate/50',
    secondary: 'bg-gradient-to-r from-pastel-pink to-rose-gold text-white hover:shadow-2xl hover:shadow-rose-gold/50',
    outline: 'bg-transparent border-2 border-chocolate text-chocolate dark:border-pastel-pink dark:text-pastel-pink hover:bg-chocolate/5',
    whatsapp: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-2xl hover:shadow-green-500/50',
  };

  const sizes = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-8 py-3.5 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  const baseClasses = `
    inline-flex items-center justify-center space-x-2 
    rounded-full font-bold 
    transition-all duration-300
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  const content = (
    <>
      {loading && (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
      <span className="relative z-10">{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      )}
      {urgency && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="ml-1"
        >
          🔥
        </motion.span>
      )}
      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 rounded-full" />
    </>
  );

  const Component = href ? 'a' : 'button';

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={fullWidth ? 'w-full' : 'inline-block'}
    >
      <Component
        href={href}
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        className={`${baseClasses} group relative overflow-hidden`}
        {...props}
      >
        {content}
      </Component>
    </motion.div>
  );
};

// Floating Action Button (FAB)
export const FloatingCTA = ({
  text = 'Order Sekarang',
  icon: Icon = FiShoppingCart,
  onClick,
  href,
  position = 'bottom-right', // 'bottom-right' | 'bottom-left'
  variant = 'primary',
  pulse = true,
}) => {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`fixed ${positions[position]} z-50`}
    >
      {pulse && (
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-full ${
            variant === 'whatsapp' ? 'bg-green-500' : 'bg-chocolate'
          }`}
        />
      )}
      <CTAButton
        onClick={onClick}
        href={href}
        variant={variant}
        size="lg"
        icon={Icon}
        iconPosition="left"
        className="shadow-2xl relative"
      >
        {text}
      </CTAButton>
    </motion.div>
  );
};

// Sticky CTA Bar (Mobile)
export const StickyCTABar = ({
  primaryText = 'Order Sekarang',
  primaryAction,
  secondaryText,
  secondaryAction,
  show = true,
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 p-4 shadow-2xl md:hidden"
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex space-x-3">
        {secondaryText && (
          <CTAButton
            onClick={secondaryAction}
            variant="outline"
            size="md"
            fullWidth
          >
            {secondaryText}
          </CTAButton>
        )}
        <CTAButton
          onClick={primaryAction}
          variant="primary"
          size="md"
          icon={FiArrowRight}
          fullWidth
          urgency
        >
          {primaryText}
        </CTAButton>
      </div>
    </motion.div>
  );
};

// CTA Card with benefits
export const CTACard = ({
  title,
  description,
  benefits = [],
  buttonText = 'Order Sekarang',
  buttonAction,
  urgencyText,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`bg-gradient-to-br from-chocolate/5 to-caramel/5 dark:from-chocolate/10 dark:to-caramel/10 rounded-3xl p-8 border-2 border-chocolate/20 dark:border-chocolate/30 ${className}`}
    >
      <h3 className="text-2xl font-bold text-chocolate dark:text-pastel-pink mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {description}
      </p>
      
      {benefits.length > 0 && (
        <ul className="space-y-3 mb-6">
          {benefits.map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3"
            >
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {urgencyText && (
        <div className="mb-4 inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-semibold">
          <span>⏰</span>
          <span>{urgencyText}</span>
        </div>
      )}

      <CTAButton
        onClick={buttonAction}
        variant="primary"
        size="lg"
        icon={FiArrowRight}
        fullWidth
        urgency={!!urgencyText}
      >
        {buttonText}
      </CTAButton>
    </motion.div>
  );
};

// WhatsApp CTA (Special styling)
export const WhatsAppCTA = ({
  phoneNumber,
  message = '',
  text = 'Chat via WhatsApp',
  size = 'md',
  fullWidth = false,
}) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <CTAButton
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      variant="whatsapp"
      size={size}
      icon={FiMessageCircle}
      iconPosition="left"
      fullWidth={fullWidth}
    >
      {text}
    </CTAButton>
  );
};

// Multi-CTA Group
export const CTAGroup = ({
  primaryText,
  primaryAction,
  secondaryText,
  secondaryAction,
  layout = 'horizontal', // 'horizontal' | 'vertical'
  className = '',
}) => {
  return (
    <div className={`flex ${layout === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-4'} ${className}`}>
      <CTAButton
        onClick={primaryAction}
        variant="primary"
        size="lg"
        icon={FiArrowRight}
        urgency
      >
        {primaryText}
      </CTAButton>
      {secondaryText && (
        <CTAButton
          onClick={secondaryAction}
          variant="outline"
          size="lg"
        >
          {secondaryText}
        </CTAButton>
      )}
    </div>
  );
};

export default {
  CTAButton,
  FloatingCTA,
  StickyCTABar,
  CTACard,
  WhatsAppCTA,
  CTAGroup,
};
