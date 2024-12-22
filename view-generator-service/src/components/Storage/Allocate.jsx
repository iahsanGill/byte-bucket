import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Allocate = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("allocating");
  const [error, setError] = useState("");

  useEffect(() => {
    const allocateStorage = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/storage/allocate",
          {
            method: "GET",
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        if (!response.ok) throw new Error("Storage allocation failed");

        setStatus("success");
        setTimeout(() => {
          navigate("/upload");
        }, 2000);
      } catch (err) {
        setError(err.message);
        setStatus("error");
      }
    };

    allocateStorage();
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
      <h2 className="text-2xl font-bold mb-6">Storage Allocation</h2>
      {status === "allocating" && (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600">Allocating storage space...</p>
        </div>
      )}
      {status === "success" && (
        <div className="space-y-4">
          <div className="text-green-500 text-6xl">✓</div>
          <p className="text-green-600">Storage allocated successfully!</p>
          <p className="text-gray-600">Redirecting to upload page...</p>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-4">
          <div className="text-red-500 text-6xl">✗</div>
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => navigate("/upload")}
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-200"
          >
            Continue anyway
          </button>
        </div>
      )}
    </div>
  );
};

export default Allocate;
