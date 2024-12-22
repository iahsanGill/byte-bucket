import { useState, useEffect } from "react";

const Welcome = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/storage/");
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center text-indigo-600">
        Welcome to VideoShare
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <video
              className="w-full aspect-video"
              controls
              src={`http://localhost:8080/api/storage/${video.fileName}`}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{video.fileName}</h3>
              <p className="text-gray-600">Uploaded by: {video.uploader}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Welcome;
