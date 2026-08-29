import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { HAILogo } from '@/components/ui/HAILogo'
import { getErrorMessage } from '@/services/api'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('staff')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, role)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-carbon-gray-10 px-6 py-12 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <HAILogo variant="primary" theme="light" size="md" />
          <p className="text-label text-primary-600">Secure Operations Platform</p>
        </div>

        <div className="border border-carbon-gray-20 bg-surface px-7 py-8">
          <h1 className="text-lg font-medium tracking-tight text-carbon-gray-100">Account Registration</h1>
          <p className="mt-1 text-xs text-carbon-gray-70">Create credentials for platform access.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Full Name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Dr. Jane Doe" autoComplete="name" />
            <Input label="Email Address" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@clinic.com" autoComplete="email" />
            <Input label="Password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" />
            <Select
              label="Privilege Role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              options={[
                { value: 'staff', label: 'Staff Member' },
                { value: 'doctor', label: 'Doctor / Physician' },
                { value: 'admin', label: 'System Administrator' },
              ]}
            />
            {error && (
              <p className="border-l-4 border-danger bg-red-50 px-3 py-2 text-xs font-medium text-danger" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="md" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-5 border-t border-carbon-gray-20 pt-5 text-center text-xs text-carbon-gray-60">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}