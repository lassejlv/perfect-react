import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { loading, data, error } = useAuth();

  if (loading) return <Spinner />;
  if (error) navigate("/login");

  return (
    <>
      <Sidebar user={data!}>
        <h1>Dashboard</h1>
      </Sidebar>
    </>
  );
}
