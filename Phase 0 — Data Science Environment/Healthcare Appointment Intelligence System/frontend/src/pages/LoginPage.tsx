import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HAILogo } from '@/components/ui/HAILogo'
import { getErrorMessage } from '@/services/api'

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

  return (
    <div className="flex min-h-screen font-sans bg-carbon-gray-10">
      {/* Left Dark Carbon Branding Panel */}
      <div
        className="hidden w-1/2 flex-col justify-between p-12 lg:flex text-white border-r border-carbon-gray-80"
        style={{ backgroundColor: '#161616' }}
      >
        <div>
          <HAILogo variant="primary" theme="dark" size="lg" />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-mono font-bold tracking-widest text-primary-400 uppercase">
            ENTERPRISE CLINICAL ANALYTICS
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white uppercase leading-snug">
            Precision Healthcare Intelligence System
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-carbon-gray-30">
            Real-time machine learning prediction engine for scheduling risk evaluation, patient no-show probabilities, queue waiting time estimations, and clinic capacity utilization monitoring.
          </p>
        </div>
        <div className="border-t border-carbon-gray-80 pt-4 text-xs font-mono text-carbon-gray-50">
          IBM Carbon Infrastructure · Scalable Machine Learning System
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="flex flex-1 items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm border border-carbon-gray-20 bg-surface p-8 shadow-card space-y-6">
          <div className="lg:hidden mb-4">
            <HAILogo variant="primary" theme="light" size="md" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-carbon-gray-100 uppercase">Operator Sign In</h1>
            <p className="mt-1 text-xs text-carbon-gray-70">Enter system credentials to access the intelligence console.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@clinic.com" autoComplete="email" />
            <Input label="System Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            {error && <p className="text-xs font-semibold text-danger">{error}</p>}
            <Button type="submit" className="w-full" size="md" loading={loading}>
              Sign In to Platform
            </Button>
          </form>

          <div className="border-t border-carbon-gray-20 pt-4 space-y-3">
            <p className="text-xs text-center font-semibold text-carbon-gray-70 uppercase tracking-widest">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="px-3 py-2 text-xs font-semibold border border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors"
                onClick={async () => {
                  setError('')
                  setLoading(true)
                  try {
                    await login('admin@gmail.com', '12345678')
                    navigate('/')
                  } catch (err) {
                    setError(getErrorMessage(err))
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                Admin
              </button>
              <button
                type="button"
                className="px-3 py-2 text-xs font-semibold border border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors"
                onClick={async () => {
                  setError('')
                  setLoading(true)
                  try {
                    await login('doctor@gmail.com', '12345678')
                    navigate('/')
                  } catch (err) {
                    setError(getErrorMessage(err))
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                Doctor
              </button>
              <button
                type="button"
                className="px-3 py-2 text-xs font-semibold border border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors"
                onClick={async () => {
                  setError('')
                  setLoading(true)
                  try {
                    await login('staff@gmail.com', '12345678')
                    navigate('/')
                  } catch (err) {
                    setError(getErrorMessage(err))
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                Staff
              </button>
            </div>
            <div className="text-center text-xs text-carbon-gray-60">
              Need an operator account?{' '}
              <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600">
                Register Credentials
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}