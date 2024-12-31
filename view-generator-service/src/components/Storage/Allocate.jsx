import React, { useState, useEffect } from "react";
import axios from "axios";

function Allocate({ token }) {
  const [storageAllocated, setStorageAllocated] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const allocateStorage = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/storage/allocate",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStorageAllocated(response.data.storageAllocated);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to allocate storage");
      }
    };

    allocateStorage();
  }, [token]);

  return (
    <div>
      <h2>Storage Allocation</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Allocated Storage: {storageAllocated} GB</p>
      <p>Please proceed to <a href="/storage/upload">upload your video</a>.</p>
    </div>
  );
}

export default Allocate;
