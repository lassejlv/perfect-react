import React from "react";
import useFetch from "react-fetch-hook";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import Container from "../components/Container";

export default function ResetPassword() {
  const navigate = useNavigate();
  const params = useParams<{ token: string }>();
  const { isLoading, error } = useFetch(`/api/validate-token?token=${params.token}`, {
    method: "POST",
  });

  if (isLoading) return <Spinner />;
  if (error) return navigate("/forgot-password");

  return (
    <Container>
      <h1 className="font-bold text-4xl">Reset Password</h1>
      <form className="flex flex-col space-y-4">
        <label className="flex flex-col">
          <span>New Password</span>
          <input type="password" name="password" className="input input-bordered input-sm" />
        </label>

        <label className="flex flex-col">
          <span>Confirm Password</span>
          <input type="password" name="confirmPassword" className="input input-bordered input-sm" />
        </label>

        <button type="submit" className="btn btn-neutral btn-sm">
          Reset Password
        </button>
      </form>
    </Container>
  );
}
