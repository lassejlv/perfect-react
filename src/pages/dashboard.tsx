import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { loading, data, error } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) navigate("/login");

  return <div>Dashboard - {data?.id}</div>;
}
