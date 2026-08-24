import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils';

const formItemVariants = cva('space-y-1', {
  variants: {
    variant: {
      default: '',
      outline: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof formItemVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof formItemVariants>
>(({ className, variant, ...props }, ref) => {
  const id = React.useId();

  return (
    <div ref={ref} className={cn(formItemVariants({ variant }), className)} {...props}>
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child) && child.type === Label) {
          return React.cloneElement(child, { htmlFor: id } as any);
        }
        return child;
      })}
    </div>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
));
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => (
  <Slot ref={ref} {...props} />
));
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500', className)}
    {...props}
  />
));
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const body = children ? children : 'This field is required';

  return (
    <p
      ref={ref}
      className={cn('flex items-center text-sm font-medium text-red-500', className)}
      {...props}
    >
      <AlertCircle className="mr-1 h-4 w-4" />
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  Label,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
