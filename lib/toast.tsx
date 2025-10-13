import toast from 'react-hot-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const showToast = ({
  title,
  description,
  variant = 'default',
}: ToastOptions) => {
  const isDestructive = variant === 'destructive';

  return toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto flex w-full max-w-[360px] items-start space-x-3 rounded-lg border p-3 shadow-lg transition-all ${
          t.visible
            ? 'animate-in slide-in-from-bottom-full'
            : 'animate-out slide-out-to-bottom-full'
        } ${
          isDestructive
            ? 'border-destructive bg-destructive text-destructive-foreground'
            : 'border bg-background text-foreground'
        }`}
      >
        <div className="grid flex-1 gap-1">
          {title && <p className="text-sm font-semibold">{title}</p>}
          {description && <p className="text-xs opacity-90">{description}</p>}
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    ),
    { duration: 5000, position: 'bottom-center' }
  );
};

export { toast };
