import React from "react";
import Container from "../components/Container";
import { RegisterSchema } from "../../utils/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";

export default function Login() {
  const navigate = useNavigate();

  // Check if the user is already logged in
  const { loading, error } = useAuth();

  if (loading) return <Spinner />;
  if (!error) navigate("/dashboard");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const parsedData = RegisterSchema.pick({ email: true, password: true }).safeParse(data);
    if (!parsedData.success) return console.error("Invalid data");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
    });

    if (!response.ok) return console.error("An error occurred");

    toast.success("Login successful");
    navigate("/dashboard");
  };

  return (
    <Container>
      <h1 className="font-bold text-4xl">Login</h1>

      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col">
          <span>Email</span>
          <input type="email" name="email" className="input input-bordered input-sm" />
        </label>

        <label className="flex flex-col">
          <span>Password</span>
          <input type="password" name="password" className="input input-bordered input-sm" />
        </label>

        <button type="submit" className="btn btn-neutral btn-sm">
          Login
        </button>
      </form>
    </Container>
  );
}
