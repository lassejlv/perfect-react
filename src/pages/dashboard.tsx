import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null); // [1
  const navigate = useNavigate();
  const { loading, data, error } = useAuth();

  if (loading) return <Spinner />;
  if (error) navigate("/login");

  const handleSubmit = async () => {
    if (!file) return toast.error("Please select a file");

    const response = await fetch(`/api/r2/upload?fileName=${file.name}`, {
      method: "POST",
      body: file,
    });

    if (!response.ok) return toast.error("Error uploading file");
  };

  return (
    <>
      <Sidebar user={data!}>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex flex-col space-y-4">
          <label htmlFor="avatar" className="label">
            Avatar
            <input
              onChange={(e) => setFile(e.target.files![0])}
              id="avatar"
              type="file"
              name="avatar"
              className="file-input file-input-bordered file-input-sm"
            />
          </label>

          <button className="btn btn-neutral btn-sm" onClick={handleSubmit}>
            Update
          </button>
        </div>
      </Sidebar>
    </>
  );
}
