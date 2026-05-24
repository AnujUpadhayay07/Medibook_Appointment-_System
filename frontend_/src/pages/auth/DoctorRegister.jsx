import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import API from '../../api/axios'

const SPECIALITIES = [
  'Cardiology', 'Dermatology', 'ENT', 'Gastroenterology',
  'General Physician', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Urology'
]

function DoctorRegister() {
  const navigate = useNavigate()
  const { dark, setDark } = useContext(ThemeContext)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', speciality: '', fees: '', experience: ''
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
      await API.post('/auth/register', { ...formData, role: 'doctor' })
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
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h4l3-9 4 18 3-9h4" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white text-2xl font-bold">MediBook</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Grow your practice<br />with MediBook
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join our network of verified specialists and connect with patients.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { number: '10k+', label: 'Patients' },
              { number: '500+', label: 'Doctors' },
              { number: '4.9', label: 'Rating' },
              { number: '24/7', label: 'Support' },
            ].map((s) => (
              <div key={s.label} className="bg-white bg-opacity-15 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">{s.number}</div>
                <div className="text-blue-100 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200 text-sm">© 2026 MediBook</p>
      </div>

      {/* Right Panel */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative overflow-y-auto ${dark ? 'bg-gray-900' : 'bg-white'}`}>
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-6 right-6 w-10 h-10 rounded-lg border flex items-center justify-center"
          style={{ borderColor: '#2563eb', color: '#2563eb' }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/register')}
            className="text-xs text-gray-400 hover:text-blue-600 mb-6 flex items-center gap-1"
          >
            ← Back to role selection
          </button>

          <h2 className={`text-3xl font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Doctor Registration
          </h2>
          <p className="text-gray-400 text-sm mb-8">Join our verified doctor network</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                <input type="text" name="name" placeholder="Dr. John Doe" value={formData.name} onChange={handleChange} className="input" required />
              </div>
              <div className="col-span-2">
                <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input type="email" name="email" placeholder="doctor@example.com" value={formData.email} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <input type="password" name="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                <input type="text" name="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} className="input" />
              </div>
            </div>

            {/* Doctor specific */}
            <div className={`p-4 rounded-xl border ${dark ? 'border-blue-900 bg-blue-950' : 'border-blue-100 bg-blue-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dark ? 'text-blue-400' : 'text-blue-700'}`}>
                Professional Details
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Speciality</label>
                  <select name="speciality" value={formData.speciality} onChange={handleChange} className="input" required>
                    <option value="">Select speciality</option>
                    {SPECIALITIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Consultation Fees (₹)</label>
                    <input type="number" name="fees" placeholder="e.g. 500" value={formData.fees} onChange={handleChange} className="input" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium mb-1.5 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Experience (years)</label>
                    <input type="number" name="experience" placeholder="e.g. 5" value={formData.experience} onChange={handleChange} className="input" />
                  </div>
                </div>
              </div>
            </div>

            <div className={`text-xs px-3 py-2 rounded-lg ${dark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
              Your account will be reviewed by admin before you can login.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm mt-1 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Registration →'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="text-blue-600 font-semibold cursor-pointer hover:underline">
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
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
        }
      `}</style>
    </div>
  )
}

export default DoctorRegister