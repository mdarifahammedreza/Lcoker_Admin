import { useEffect, useState } from 'react';
import './App.css';
import KeyManagement from './handle';
import KeyStatus from './keys';
import TerminalLog from './TerminalLog';

const base_uri = "https://locker-8w4r.onrender.com/";

// Use the base URL to build complete endpoint URLs
const uri = `${base_uri}api/student/stack`;
const registerUri = `${base_uri}api/student/register`;
const findUri = `${base_uri}api/student/info`;
const addKeyUri = `${base_uri}api/key/add`;
// const logUri = `${base_uri}api/student/logs`;

// Alert Component
const Alert = ({ message, type }) => {
  const alertStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${alertStyles[type]}`}>
      {message}
    </div>
  );
};

// KeyInfoBox Component
const KeyInfoBox = ({ title, count, colSpan = 1 }) => (
  <div className={`bg-gray-800 p-4 shadow-lg rounded-lg border border-gray-700 ${colSpan === 2 ? 'col-span-2' : 'col-span-1'}`}>
    <p className="font-serif text-xl font-semibold text-gray-300">{title}</p>
    <p className="flex justify-center h-1/3 text-3xl font-bold text-gray-100 text-center items-center">{count}</p>
  </div>
);

// TerminalLog Component


function App() {
  const [rfId, setRfId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [message, setMessage] = useState('');
  const [keys, setKeys] = useState([]);
  const [registerMessage, setRegisterMessage] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeForm, setActiveForm] = useState('register');
  const [studentData, setStudentData] = useState(null);
  const [keyNumber, setKeyNumber] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });

  // Show Alert Function
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 3000); // Hide alert after 3 seconds
  };

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${base_uri}api/student/stack`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setData(data.data);
        console.log(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchKeys = async () => {
      try {
        const response = await fetch(`${base_uri}api/key/all`);
        if (!response.ok) throw new Error('Network response was not ok');
        const keys = await response.json();
        setKeys(keys);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchKeys();
  }, []);

  // Handle Delete Student
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${base_uri}api/student/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        showAlert('Student deleted successfully!', 'success');
      } else {
        const errorData = await response.json();
        showAlert(`Error: ${errorData.message}`, 'error');
      }
    } catch (error) {
      showAlert(`Error: ${error.message}`, 'error');
    }
  };

  // Handle Update Student
  const handleUpdate = async (updatedData) => {
    try {
      const response = await fetch(`${base_uri}api/student/update/${updatedData.studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const data = await response.json();
        showAlert('Student updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        showAlert(`Error: ${errorData.message}`, 'error');
      }
    } catch (error) {
      showAlert(`Error: ${error.message}`, 'error');
    }
  };

  // Handle Register Student
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(registerUri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, studentId, rfId }),
      });

      const data = await response.json();
      if (response.ok) {
        showAlert('Student registered successfully!', 'success');
        setStudentName('');
        setStudentId('');
        setRfId('');
      } else {
        showAlert(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      showAlert(`Error: ${error.message}`, 'error');
    }
  };

  // Handle Find Student
  const handleFindStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${base_uri}api/student/info/${studentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
        showAlert('Student found!', 'success');
      } else {
        showAlert('Student not found!', 'error');
      }
    } catch (error) {
      showAlert(`Error: ${error.message}`, 'error');
    }
  };

  // Handle Add Key
  const handleAddKey = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(addKeyUri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: keyNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        showAlert('Key added successfully!', 'success');
        setKeyNumber('');
      } else {
        const errorData = await response.json();
        showAlert(`Error: ${errorData.message}`, 'error');
      }
    } catch (error) {
      showAlert(`Error: ${error.message}`, 'error');
    }
  };

  // Loading and Error States
  if (loading) return <div className="text-gray-100 text-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-400 text-center mt-10">Error: {error}</div>;

  // Key and Student Counts
  const availableKeys = keys?.filter((key) => key?.status === "available")?.length || 0;
  const takenKeys = keys?.filter((key) => key?.status === "assigned")?.length || 0;
  const bannedStudents = Array.isArray(data) ? data.filter((student) => student?.studentBannedStatus === "Yes").length : 0;
  const totalWarnings = Array.isArray(data) ? data.filter((student) => student?.studentWarningStatus === "Yes").length : 0;

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-gray-100">
      {/* Alert Component */}
      {alert.message && <Alert message={alert.message} type={alert.type} />}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-500">Library Locker Management</h1>
        <p className="text-gray-400 mt-2">Transfer your analog locker system into digital.</p>
      </div>

      {/* Key Info Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KeyInfoBox title="Available Keys" count={availableKeys} colSpan={2} />
        <KeyInfoBox title="Taken Keys" count={takenKeys} colSpan={2} />
        <KeyInfoBox title="Issued Warnings" count={totalWarnings} />
        <KeyInfoBox title="Banned Students" count={bannedStudents} />
      </div>

      {/* Forms and Terminal Log */}
      <div className='flex gap-6'>
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md w-1/2">
          <div className="flex justify-center space-x-4 mb-6">
            {['register', 'find', 'key'].map(type => (
              <button
                key={type}
                onClick={() => setActiveForm(type)}
                className={`py-2 px-4 rounded-lg font-semibold transition duration-200 ${activeForm === type ? 'bg-blue-600 text-cyan-500' : 'bg-gray-700 text-gray-300'}`}
              >
                {type === 'register' ? 'Register Student' : type === 'find' ? 'Find Student' : 'Add Key'}
              </button>
            ))}
          </div>

          {activeForm === 'register' && (
            <form className="space-y-4 bg-gray-900 rounded-xl shadow-lg" onSubmit={handleRegister}>
              <h2 className="text-xl pt-2 font-semibold text-cyan-500 text-center">Register Student</h2>
              <div className="space-y-2 m-2">
                <input
                  type="text"
                  placeholder="Student Name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-cyan-500 focus:ring-2 focus:ring-blue-500"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Student ID"
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-cyan-500 focus:ring-2 focus:ring-blue-500"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="RFID"
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-cyan-500 focus:ring-2 focus:ring-blue-500"
                  value={rfId}
                  onChange={(e) => setRfId(e.target.value)}
                />
              </div>
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300">
                Register Student
              </button>
            </form>
          )}

          {activeForm === 'find' && (
            <form className="space-y-4 bg-gray-900 rounded-xl shadow-lg" onSubmit={handleFindStudent}>
              <h2 className="text-xl pt-2 font-semibold text-cyan-500 text-center">Find Student</h2>
              <div className="space-y-2 m-2">
                <input
                  type="text"
                  placeholder="Student ID"
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-cyan-500 focus:ring-2 focus:ring-blue-500"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-cyan-500 font-semibold rounded-lg transition duration-300">
                Find Student
              </button>
            </form>
          )}

          {activeForm === 'key' && (
            <form className="space-y-4 bg-gray-900 rounded-xl shadow-lg" onSubmit={handleAddKey}>
              <h2 className="text-xl pt-2 font-semibold text-cyan-500 text-center">Add Key</h2>
              <div className="space-y-2 m-2">
                <input
                  type="text"
                  placeholder="Key Number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-cyan-500 focus:ring-2 focus:ring-blue-500"
                  value={keyNumber}
                  onChange={(e) => setKeyNumber(e.target.value)}
                />
              </div>
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-cyan-500 font-semibold rounded-lg transition duration-300">
                Add Key
              </button>
            </form>
          )}
        </div>

        {/* Terminal Log */}
        <div className='w-1/2 mt-8'>
          <TerminalLog/>
        </div>
      </div>

      {/* Student Table and Key Management */}
      <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md">
        <button
          onClick={() => setActiveForm(activeForm === 'studentDetails' ? 'keyManagement' : 'studentDetails')}
          className="py-2 px-4 rounded-lg font-semibold transition duration-200 bg-blue-600 text-cyan-500"
        >
          {activeForm === 'studentDetails' ? 'Show Key Management' : 'Show Student Details'}
        </button>
        <div className="mt-4">
          {activeForm === 'studentDetails' ? (
            data.length > 0 ? (
              <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md">
                <StudentTable data={data} onDelete={handleDelete} onUpdate={handleUpdate} />
              </div>
            ) : (
              <p className="text-gray-300">No student data available.</p>
            )
          ) : (
            <KeyManagement />
          )}
        </div>
      </div>
      <KeyStatus />
    
    </div>
  );
}

// StudentTable Component
export function StudentTable({ data, onDelete, onUpdate }) {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    rfId: '',
    keyStatus: '',
    studentWarningStatus: '',
    studentBannedStatus: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      onUpdate(formData);
    } else {
      console.log("Submit new student data:", formData);
    }
    setFormData({
      studentId: '',
      studentName: '',
      rfId: '',
      keyStatus: '',
      studentWarningStatus: '',
      studentBannedStatus: ''
    });
    setIsEditing(false);
  };

  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
  };

  return (
    <div>
      {/* Form for adding or updating data */}
      <form onSubmit={handleSubmit} className="mb-4 bg-gray-800 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Student ID"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            placeholder="Student Name"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="rfId"
            value={formData.rfId}
            onChange={handleChange}
            placeholder="RFID"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="keyStatus"
            value={formData.keyStatus}
            onChange={handleChange}
            placeholder="Key Status"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="studentWarningStatus"
            value={formData.studentWarningStatus}
            onChange={handleChange}
            placeholder="Warning Status"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="studentBannedStatus"
            value={formData.studentBannedStatus}
            onChange={handleChange}
            placeholder="Banned Status"
            className="p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          {isEditing ? "Update" : "Add Student"}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-gray-800 text-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-4 text-left">Student ID</th>
              <th className="py-2 px-4 text-left">Student Name</th>
              <th className="py-2 px-4 text-left">RFID</th>
              <th className="py-2 px-4 text-left">Key Status</th>
              <th className="py-2 px-4 text-left">Warning Status</th>
              <th className="py-2 px-4 text-left">Banned Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((value) => (
              <tr key={value.studentId} className="border-b border-gray-700">
                <td className="py-2 px-4">{value.studentId}</td>
                <td className="py-2 px-4">{value.studentName}</td>
                <td className="py-2 px-4">{value.rfId}</td>
                <td className="py-2 px-4">{value.keyStatus}</td>
                <td className="py-2 px-4">{value.studentWarningStatus}</td>
                <td className="py-2 px-4">{value.studentBannedStatus}</td>
                <td className="py-2 px-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(value)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(value.studentId)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>


     
      </div>
      
    </div>
  );
}

export default App;