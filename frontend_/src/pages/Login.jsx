import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'
import API from '../api/axios'
import { Moon, Sun } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { dark, setDark } = useContext(ThemeContext)

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await API.post('/auth/login', formData)
      login(data)
      if (data.role === 'patient') navigate('/patient/dashboard')
      else if (data.role === 'doctor') navigate('/doctor/dashboard')
      else if (data.role === 'admin') navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex relative ${dark ? 'bg-gray-900' : 'bg-white'}`}>

      {/* TOP RIGHT THEME BUTTON (LIKE NAVBAR) */}
      <button
        onClick={() => setDark(!dark)}
        className={`fixed top-5 right-5 z-50 w-10 h-10 rounded-lg flex items-center justify-center border transition
          ${dark 
            ? 'bg-gray-800 border-gray-700 text-teal-400' 
            : 'bg-white border-gray-200 text-teal-600'}
        `}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h4l3-9 4 18 3-9h4" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white text-2xl font-bold">MediBook</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your Health,<br />Our Priority
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            Access your appointments, prescriptions and health records all in one place.
          </p>
        </div>

        <p className="text-teal-200 text-sm">© 2026 MediBook</p>
      </div>

      {/* Right Panel */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center px-6 py-12 transition ${dark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-teal-500 rounded-xl p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h4l3-9 4 18 3-9h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-teal-600 text-xl font-bold">MediBook</span>
          </div>

          <h2 className={`text-3xl font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back
          </h2>
          <p className="text-gray-400 mb-8 text-sm">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div>
              <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition
                  ${dark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-200'}
                `}
                required
              />
            </div>

            <div>
              <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition
                  ${dark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-200'}
                `}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm transition"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-teal-600 transition">
              ← Back to home
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login
