import React, { useEffect, useState } from 'react';

const KeyStatus = () => {
  const base_uri = 'https://locker-8w4r.onrender.com/api/';
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch all keys
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch(`${base_uri}key/all`);
        const text = await response.text();
console.log(text)
        // Check if the response is JSON
        try {
          const data = JSON.parse(text);
          if (response.ok) {
            setKeys(data);
          } else {
            throw new Error(data.message || 'Failed to fetch keys');
          }
        } catch (error) {
          // Handle non-JSON responses (e.g., HTML error pages)
          console.error('Server returned non-JSON response:', text);
          throw new Error('Server error: Invalid response');
        }
      } catch (error) {
        console.error('Error fetching keys:', error);
        showAlert(`Error fetching keys: ${error.message}`, 'error');
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchKeys();
  }, []);

  // Show alert function
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 3000);
  };

  // Handle Update (open modal)
  const handleUpdate = (keyId) => {
    const keyToUpdate = keys.find((key) => key.keyId === keyId);
    if (!keyToUpdate) {
      showAlert('Key not found', 'error');
      return;
    }
    setSelectedKey(keyToUpdate);
    setNewStatus(keyToUpdate.status);
    setNewAssignedTo(keyToUpdate.assignedTo || '');
    setShowModal(true);
  };

  // Handle Save (update key)
  const handleSave = async () => {
    if (!newStatus && !newAssignedTo) {
      showAlert('Status or Assigned To is required', 'error');
      return;
    }

    try {
      const response = await fetch(`${base_uri}key/update/${selectedKey.keyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          assignedTo: newAssignedTo || 'Not assigned',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update key');
      }

      // Update the key in the state
      setKeys((prevKeys) =>
        prevKeys.map((key) =>
          key.keyId === selectedKey.keyId
            ? { ...key, status: newStatus, assignedTo: newAssignedTo || 'Not assigned' }
            : key
        )
      );

      showAlert('Key updated successfully', 'success');
      setShowModal(false);
    } catch (error) {
      console.error('Error updating key:', error);
      showAlert(`Error updating key: ${error.message}`, 'error');
    }
  };

  // Handle Delete
  const handleDelete = async (keyId) => {
    try {
      const response = await fetch(`${base_uri}key/delete/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete key');
      }

      // Remove the key from the state
      setKeys((prevKeys) => prevKeys.filter((key) => key.keyId !== keyId));
      showAlert('Key deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting key:', error);
      showAlert(`Error deleting key: ${error.message}`, 'error');
    }
  };

  return (
    <div className="container mx-auto p-5">
      {/* Alert Component */}
      {alert.message && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {alert.message}
        </div>
      )}

      <h2 className="text-white text-3xl mb-4">Keys</h2>

      {/* Loading State */}
      {loading ? (
        <div className="text-white text-center">Loading keys...</div>
      ) : keys.length === 0 ? (
        <div className="text-white text-center">No keys found.</div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
          <table className="table-auto w-full text-white">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left border-b border-gray-700">Key ID</th>
                <th className="px-4 py-2 text-left border-b border-gray-700">Status</th>
                <th className="px-4 py-2 text-left border-b border-gray-700">Assigned To</th>
                <th className="px-4 py-2 text-left border-b border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.keyId} className="bg-gray-700 hover:bg-gray-600">
                  <td className="px-4 py-2">{key.keyId}</td>
                  <td className="px-4 py-2">{key.status}</td>
                  <td className="px-4 py-2">{key.assignedTo || 'Not assigned'}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleUpdate(key.keyId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm mr-2"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(key.keyId)}
                      className="bg-red-500 text-white px-4 py-2 rounded-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Key Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-white text-2xl mb-4">Update Key</h3>
            <div className="mb-4">
              <label className="text-white">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 mt-2 rounded-sm text-black"
              >
                <option value="available">Available</option>
                <option value="taken">Taken</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-white">Assigned To</label>
              <input
                type="text"
                value={newAssignedTo}
                onChange={(e) => setNewAssignedTo(e.target.value)}
                placeholder="Enter student ID"
                className="w-full p-2 mt-2 rounded-sm text-black"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyStatus;