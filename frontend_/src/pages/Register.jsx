import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import { FaUser, FaUserMd } from 'react-icons/fa'

function Register() {
  const navigate = useNavigate()
  const { dark, setDark } = useContext(ThemeContext)

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 relative ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>

      <button
        onClick={() => setDark(!dark)}
        className="absolute top-6 right-6 w-10 h-10 rounded-lg border flex items-center justify-center"
        style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="flex items-center gap-3 mb-10">
        <div className="bg-teal-500 rounded-xl p-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l3-9 4 18 3-9h4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>MediBook</span>
      </div>

      <div className={`w-full max-w-md rounded-2xl p-8 ${dark ? 'bg-gray-800' : 'bg-white'} border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-2xl font-bold text-center mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
          Join MediBook
        </h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          How would you like to register?
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/register/patient')}
            className={`flex items-center gap-4 p-5 rounded-xl border-2 transition hover:border-teal-500 group ${dark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-teal-50'}`}
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <FaUser size={20} color="#0d9488" />
            </div>
            <div className="text-left">
              <div className={`font-semibold text-base ${dark ? 'text-white' : 'text-gray-900'}`}>
                Register as Patient
              </div>
              <div className="text-gray-400 text-sm">
                Book appointments with top doctors
              </div>
            </div>
            <span className="ml-auto text-teal-500 text-lg">→</span>
          </button>

          <button
            onClick={() => navigate('/register/doctor')}
            className={`flex items-center gap-4 p-5 rounded-xl border-2 transition hover:border-blue-500 group ${dark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-blue-50'}`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaUserMd size={20} color="#2563eb" />
            </div>
            <div className="text-left">
              <div className={`font-semibold text-base ${dark ? 'text-white' : 'text-gray-900'}`}>
                Register as Doctor
              </div>
              <div className="text-gray-400 text-sm">
                Join our network of verified specialists
              </div>
            </div>
            <span className="ml-auto text-blue-500 text-lg">→</span>
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-teal-600 font-semibold cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>
        <div className="text-center mt-3">
          <span
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 hover:text-teal-600 cursor-pointer"
          >
            ← Back to home
          </span>
        </div>
      </div>
    </div>
  )
}

export default Register