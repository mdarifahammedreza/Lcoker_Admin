import { useEffect, useState } from 'react';
import './App.css';
import KeyManagement from './handle';
const base_uri = "https://locker-silk.vercel.app/";

// Use the base URL to build complete endpoint URLs
const uri = `${base_uri}api/student/stack`;
const registerUri = `${base_uri}api/student/register`;
const findUri = `${base_uri}api/student/info`;
const addKeyUri = `${base_uri}api/key/add`;
const logUri = `${base_uri}api/student/logs`;


const KeyInfoBox = ({ title, count, colSpan = 1 }) => (
  <div className={`bg-gray-800 p-4 shadow-lg rounded-lg border border-gray-700 ${colSpan === 2 ? 'col-span-2' : 'col-span-1'}`}>
    <p className="font-serif text-xl font-semibold text-gray-300">{title}</p>
    <p className="flex justify-center h-1/3 text-3xl font-bold text-gray-100 text-center items-center">{count}</p>
  </div>
);

const TerminalLog = ({ logs }) => (
  <div className='w-full h-full'>

    <div className="bg-black text-green-400 p-4 rounded-lg font-mono h-64 overflow-auto border border-gray-700 shadow-lg relative">
      <h2 className="text-xl bg-gray-950 px-1 py-1 font-semibold text-cyan-500 sticky top-0 left-0">Terminal- Vendor Log</h2>
      <div className="h-full w-full p-2">
        {logs.length > 0 ? logs.map((log, index) => (
          <p key={index} className="whitespace-pre">{`> ${log.timestamp} - ${log.message}`}</p>
        )) : <p>:-- No logs available...</p>}
      </div>
    </div>
  </div>
);


function App() {
  const [rfId, setRfId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [message, setMessage] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeForm, setActiveForm] = useState('register');
  const [studentData, setStudentData] = useState(null);
  const [keyNumber, setKeyNumber] = useState('');
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${base_uri}api/student/stack`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setData(data);
      } catch (error) {
        // setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-gray-100 text-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-400 text-center mt-10">Error: {error}</div>;

  const availableKeys = data.filter(student => student.keyStatus === 'Available').length;
  const takenKeys = data.filter(student => student.keyStatus === 'Taken').length;
  const bannedStudents = data.filter(student => student.studentBannedStatus).length;
  const totalWarnings = data.reduce((sum, student) => sum + student.studentWarningStatus, 0);

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-500">Library Locker Management</h1>
        <p className="text-gray-400 mt-2">Transfer your analog locker system into digital.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KeyInfoBox title="Available Keys" count={availableKeys} colSpan={2} />
        <KeyInfoBox title="Taken Keys" count={takenKeys} colSpan={2} />
        <KeyInfoBox title="Issued Warnings" count={totalWarnings} />
        <KeyInfoBox title="Banned Students" count={bannedStudents} />
      </div>

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
            <form className="space-y-4 bg-gray-900 rounded-xl shadow-lg" onSubmit={async (e) => {
              e.preventDefault();
              try {
                console.log({ studentName, studentId, rfId });
                const response = await fetch(registerUri, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ studentName, studentId, rfId })
                });
                const data = await response.json();
                setRegisterMessage(data.message);
                setStudentName('');
                setStudentId('');
                setRfId('');
              } catch (error) {
                setRegisterMessage(error.message);
              }
            }}>
              <h2 className="text-xl pt-2 font-semibold text-cyan-500 text-center ">Register Student</h2>
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
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-cyan-500 font-semibold rounded-lg transition duration-300">
                Register Student
              </button>
              <p>{registerMessage}</p>
            </form>

          )}

          {activeForm === 'find' && (
            <form className="space-y-4 bg-gray-900 rounded-xl shadow-lg" onSubmit={async (e) => {
              e.preventDefault();
              
              const findUri = `${base_uri}api/student/info/${studentId}`; // Include studentId in URL
              console.log({ studentId });
              console.log(findUri);
          
              try {
                  const response = await fetch(findUri, {
                      method: 'GET',  // GET request should not have a body
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  });
          
                  if (!response.ok) {
                      throw new Error("Student not found");
                  }
          
                  const data = await response.json();
                  setStudentData(data);
              } catch (error) {
                  setMessage(error.message);
              }
          }}
          >
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
            <form className="space-y-4 bg-gray-900 rounded-xl shadow-lg" onSubmit={async (e) => {
              e.preventDefault();
              try {
                  const response = await fetch(addKeyUri, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ keyId: keyNumber })  // Fix: Use "keyId" instead of "keyNumber"
                  });
          
                  const data = await response.json();
          
                  if (!response.ok) {
                      throw new Error(data.message || "Failed to add key");
                  }
          
                  setRegisterMessage(data.message);  // Fix: Show success message
                  setKeyNumber('');
              } catch (error) {
                  setRegisterMessage(error.message);
              }
          }}
          >
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
        <div className='w-1/2 mt-8'><TerminalLog logs={logs} /></div>
      </div>

<KeyManagement/>
    </div>
  );
}

export default App;
