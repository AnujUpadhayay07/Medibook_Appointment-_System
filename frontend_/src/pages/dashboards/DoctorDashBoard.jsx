import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function DoctorDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const name = localStorage.getItem('name')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">MediBook</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">👨‍⚕️ Dr. {name}</span>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Today's Appointments", value: '0', icon: '📅', color: 'bg-blue-50 border-blue-200' },
            { label: 'Total Patients', value: '0', icon: '👥', color: 'bg-purple-50 border-purple-200' },
            { label: 'Total Earnings', value: '₹0', icon: '💰', color: 'bg-green-50 border-green-200' },
          ].map((stat) => (
            <div key={stat.label} className={`p-6 rounded-2xl border ${stat.color} flex items-center gap-4`}>
              <span className="text-4xl">{stat.icon}</span>
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
          <div className="text-center py-10 text-gray-400">
            <p className="text-5xl mb-3">📭</p>
            <p>No appointments scheduled yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard