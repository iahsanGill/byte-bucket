import React, { useState } from "react";
import axios from "axios";

function Delete({ token }) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fileName) {
      setError("Please enter a filename");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/storage/delete",
        { fileName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setFileName("");
    } catch (err) {
      setError(err.response?.data?.message || "File deletion failed");
    }
  };

  return (
    <div>
      <h2>Delete File</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Filename:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required
            placeholder="Enter filename to delete"
          />
        </div>
        <button type="submit">Delete File</button>
      </form>
    </div>
  );
}

export default Delete;
