import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import API from '../../api/axios'

function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('doctors')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const fetchDoctors = async () => {
    try {
      const { data } = await API.get('/admin/doctors')
      setDoctors(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users')
      setUsers(data)
    } catch (err) {
      console.error(err)
    }
  }

  const approveDoctor = async (id) => {
    try {
      await API.put(`/admin/approve/${id}`)
      fetchDoctors()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDoctors()
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">MediBook Admin</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Logout</button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Doctors', value: doctors.length, icon: '', color: 'bg-blue-50 border-blue-200' },
            { label: 'Pending Approval', value: doctors.filter(d => !d.isApproved).length, icon: '', color: 'bg-yellow-50 border-yellow-200' },
            { label: 'Total Patients', value: users.filter(u => u.role === 'patient').length, icon: '', color: 'bg-green-50 border-green-200' },
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

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['doctors', 'patients'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl font-semibold capitalize transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Doctors Table */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">All Doctors</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Speciality</th>
                  <th className="pb-3">Fees</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium">{doc.name}</td>
                    <td className="py-3 text-gray-500">{doc.email}</td>
                    <td className="py-3">{doc.speciality || '-'}</td>
                    <td className="py-3">₹{doc.fees || '-'}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doc.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3">
                      {!doc.isApproved && (
                        <button
                          onClick={() => approveDoctor(doc._id)}
                          className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Patients Table */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">All Patients</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'patient').map((patient) => (
                  <tr key={patient._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium">{patient.name}</td>
                    <td className="py-3 text-gray-500">{patient.email}</td>
                    <td className="py-3">{patient.phone || '-'}</td>
                    <td className="py-3 text-gray-500">{new Date(patient.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
