import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Generate data-testid based on title for testing
        const testId = title === "Application Submitted" ? "toast-application-success" : 
                      title === "Cannot Process Application" ? "toast-application-blocked" :
                      title === "Error" ? "toast-application-error" : "toast-notification";
        
        return (
          <Toast key={id} {...props} data-testid={testId}>
            <div className="grid gap-1">
              {title && <ToastTitle data-testid={`${testId}-title`}>{title}</ToastTitle>}
              {description && (
                <ToastDescription data-testid={`${testId}-description`}>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
