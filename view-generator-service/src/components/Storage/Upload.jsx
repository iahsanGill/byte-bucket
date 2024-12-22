import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await fetch("http://localhost:8080/api/storage/upload", {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Upload Video</h2>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Select Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default Upload;
