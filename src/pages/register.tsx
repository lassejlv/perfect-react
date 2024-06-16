import React from "react";
import Container from "../components/Container";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { RegisterSchema } from "../../utils/zod";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  // Check if the user is already logged in
  const { loading, error } = useAuth();

  if (loading) return <Spinner />;
  if (!error) navigate("/dashboard");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const parsedData = RegisterSchema.safeParse(data);
    if (!parsedData.success) return toast.error("Invalid data");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
    });

    if (!response.ok) return toast.error("An error occurred");

    const json = await response.json();
    toast.success(json.message);

    navigate("/login");
  };

  return (
    <Container>
      <h1 className="font-bold text-4xl">Register</h1>

      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col">
          <span>Email</span>
          <input type="email" name="email" className="input input-bordered input-sm" />
        </label>

        <label className="flex flex-col">
          <span>Username</span>
          <input type="text" name="username" className="input input-bordered input-sm" />
        </label>

        <label className="flex flex-col">
          <span>Password</span>
          <input type="password" name="password" className="input input-bordered input-sm" />
        </label>

        <button type="submit" className="btn btn-neutral btn-sm">
          Register
        </button>
      </form>
    </Container>
  );
}
