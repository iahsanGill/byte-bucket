import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Delete = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/storage/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) throw new Error("Delete failed");

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Delete Video</h2>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">File Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
        >
          Delete
        </button>
      </form>
    </div>
  );
};

export default Delete;
