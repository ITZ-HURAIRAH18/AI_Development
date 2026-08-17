import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/services/api'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Branding panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-background p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-700 text-white">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold text-charcoal">Healthcare Intelligence</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-charcoal">
            Predict appointment risk, optimize clinic operations, and improve patient flow.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal-muted">
            A clinic operations intelligence platform for no-show prediction, waiting-time
            estimation and scheduling risk management.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { label: 'No-show prediction', value: 'Probability-based appointment risk estimates' },
              { label: 'Waiting time', value: 'Expected patient wait based on clinic load' },
              { label: 'Scheduling risk', value: 'Operational risk scoring with contributing factors' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                <ShieldAlert className="mt-0.5 h-5 w-5 text-primary-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-charcoal">{item.label}</p>
                  <p className="text-sm text-charcoal-muted">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-charcoal-muted">© {new Date().getFullYear()} Healthcare Intelligence. Operational analytics only.</p>
      </div>

      {/* Login card */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-700 text-white">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold text-charcoal">Healthcare Intelligence</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Sign in</h1>
          <p className="mt-1 text-sm text-charcoal-muted">Access your clinic operations dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@clinic.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
            {error && <p className="text-sm text-danger" role="alert">{error}</p>}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary-700 focus:ring-primary-500"
                />
                Remember me
              </label>
              <button type="button" className="text-sm text-primary-700 hover:text-primary-800">
                Forgot password
              </button>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-muted">
            New to the platform?{' '}
            <Link to="/register" className="font-medium text-primary-700 hover:text-primary-800">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}