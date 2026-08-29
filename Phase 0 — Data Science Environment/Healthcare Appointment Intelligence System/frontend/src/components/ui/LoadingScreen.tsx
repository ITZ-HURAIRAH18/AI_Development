import { HAILogo } from './HAILogo'

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Logo with animation */}
      <div className="animate-fade-in">
        <HAILogo variant="primary" theme="dark" size="lg" />
      </div>

      {/* Loading Text */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Healthcare Appointment Intelligence
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Initializing system...
          </p>
        </div>

        {/* Spinner */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />
        </div>
      </div>

      {/* Optional: Loading dots animation */}
      <div className="flex items-center justify-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-bounce dark:bg-blue-500" style={{ animationDelay: '0s' }} />
        <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-bounce dark:bg-blue-500" style={{ animationDelay: '0.2s' }} />
        <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-bounce dark:bg-blue-500" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}
