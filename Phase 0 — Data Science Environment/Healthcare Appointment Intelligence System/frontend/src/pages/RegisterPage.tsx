import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
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
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-700 text-white">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold text-charcoal">Healthcare Intelligence</span>
        </div>

        <div className="rounded-lg border border-border bg-surface p-8 shadow-card">
          <h1 className="text-xl font-semibold tracking-tight text-charcoal">Create an account</h1>
          <p className="mt-1 text-sm text-charcoal-muted">Register to access the operations dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Full name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane Doe" autoComplete="name" />
            <Input label="Email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@clinic.com" autoComplete="email" />
            <Input label="Password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
            <Select
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              options={[
                { value: 'staff', label: 'Staff' },
                { value: 'doctor', label: 'Doctor' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            {error && <p className="text-sm text-danger" role="alert">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-700 hover:text-primary-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}