import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import API from '../../api/axios'

function PatientRegister() {
  const navigate = useNavigate()
  const { dark, setDark } = useContext(ThemeContext)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/register', { ...formData, role: 'patient' })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-gray-900' : 'bg-white'}`}>

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h4l3-9 4 18 3-9h4" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white text-2xl font-bold">MediBook</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your health journey<br />starts here
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            Book appointments with verified doctors in minutes.
          </p>
          <div className="flex flex-col gap-3">
            {['Find doctors by speciality', 'Book slots instantly', 'Track your appointments'].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white text-xs">✓</div>
                <span className="text-teal-50 text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-teal-200 text-sm">© 2026 MediBook</p>
      </div>

      {/* Right Panel */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative ${dark ? 'bg-gray-900' : 'bg-white'}`}>
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-6 right-6 w-10 h-10 rounded-lg border flex items-center justify-center"
          style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/register')}
            className="text-xs text-gray-400 hover:text-teal-600 mb-6 flex items-center gap-1"
          >
            ← Back to role selection
          </button>

          <h2 className={`text-3xl font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Patient Registration
          </h2>
          <p className="text-gray-400 text-sm mb-8">Create your patient account</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="input"
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
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm mt-1 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </>
              ) : 'Create Patient Account →'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="text-teal-600 font-semibold cursor-pointer hover:underline">
              Sign in
            </span>
          </p>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid ${dark ? '#374151' : '#e5e7eb'};
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          background: ${dark ? '#1f2937' : '#f9fafb'};
          color: ${dark ? '#f9fafb' : '#111827'};
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: #14b8a6;
          box-shadow: 0 0 0 2px rgba(20,184,166,0.2);
        }
      `}</style>
    </div>
  )
}

export default PatientRegister