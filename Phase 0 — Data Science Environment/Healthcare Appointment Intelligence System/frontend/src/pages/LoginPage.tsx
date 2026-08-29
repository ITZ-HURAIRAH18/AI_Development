import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HAILogo } from '@/components/ui/HAILogo'
import { getErrorMessage } from '@/services/api'
import { ShieldCheck } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@clinic.com')
  const [password, setPassword] = useState('password123')
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

  const demoLogin = async (demoEmail: string) => {
    setError('')
    setLoading(true)
    try {
      await login(demoEmail, '12345678')
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-carbon-gray-10 px-6 py-12 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <HAILogo variant="primary" theme="light" size="md" />
          <div>
            <p className="text-label text-primary-600">Secure Operations Platform</p>
            <p className="mt-1 text-xs text-carbon-gray-70">
              Protected access for authorized clinical operators.
            </p>
          </div>
        </div>

        <div className="border border-carbon-gray-20 bg-surface px-7 py-8">
          <h1 className="text-lg font-medium tracking-tight text-carbon-gray-100">Operator Sign In</h1>
          <p className="mt-1 text-xs text-carbon-gray-70">Enter your credentials to access the intelligence console.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@clinic.com" autoComplete="email" />
            <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            {error && (
              <p className="border-l-4 border-danger bg-red-50 px-3 py-2 text-xs font-medium text-danger" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="md" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 border-t border-carbon-gray-20 pt-5">
            <p className="text-label text-carbon-gray-60">Demo Accounts</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'Admin', email: 'admin@gmail.com' },
                { label: 'Doctor', email: 'doctor@gmail.com' },
                { label: 'Staff', email: 'staff@gmail.com' },
              ].map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => demoLogin(account.email)}
                  disabled={loading}
                  className="border border-carbon-gray-30 bg-surface px-2 py-2 text-xs font-medium text-carbon-gray-80 hover:bg-carbon-gray-10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-carbon-gray-60">
            Need an operator account?{' '}
            <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600">
              Register
            </Link>
          </p>
          <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-carbon-gray-20 pt-4 text-[10px] text-carbon-gray-50">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            All sessions are authenticated and audit-logged.
          </div>
        </div>
      </div>
    </div>
  )
}