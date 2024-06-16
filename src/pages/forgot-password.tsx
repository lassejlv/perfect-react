import React from "react";
import Container from "../components/Container";
import { RegisterSchema } from "../../utils/zod";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const parsedData = RegisterSchema.pick({ email: true }).safeParse(data);
    if (!parsedData.success) return console.error("Invalid data");

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
    });

    if (!response.ok) return console.error("An error occurred");

    return toast.success("Success! Now check your email");
  };

  return (
    <Container>
      <h1 className="font-bold text-4xl">Forgot Password</h1>

      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col">
          <span>Email</span>
          <input type="email" name="email" className="input input-bordered input-sm" />
        </label>

        <button type="submit" className="btn btn-neutral btn-sm">
          Reset Password
        </button>
      </form>
    </Container>
  );
}
