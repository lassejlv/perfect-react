import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { loading, data, error } = useAuth();

  if (loading) return <Spinner />;
  if (error) navigate("/login");
  if (!data) return navigate("/login");

  return (
    <>
      <Sidebar user={data!}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-lg">Welcome back, {data.username}!</p>
      </Sidebar>
    </>
  );
}
