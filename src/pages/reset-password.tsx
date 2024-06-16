import useFetch from "react-fetch-hook";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import Container from "../components/Container";
import toast from "react-hot-toast";
import { z } from "zod";

export default function ResetPassword() {
  const navigate = useNavigate();
  const params = useParams<{ token: string }>();
  const { isLoading, error } = useFetch(`/api/validate-token?token=${params.token}`, {
    method: "POST",
  });

  if (isLoading) return <Spinner />;
  if (error) return navigate("/forgot-password");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const schema = z.object({
      password: z.string(),
      confirmPassword: z.string().refine((data) => data === password, {
        message: "Passwords do not match",
      }),
    });

    const parsedData = schema.safeParse({ password, confirmPassword });

    if (!parsedData.success) {
      return toast.error(parsedData.error.errors[0].message);
    }

    const response = await fetch("/api/reset-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: params.token,
        password,
      }),
    });

    if (!response.ok) {
      return toast.error("An error occurred while resetting password");
    }

    toast.success("Password reset successfully");
    return navigate("/login");
  };

  return (
    <Container>
      <h1 className="font-bold text-4xl">Reset Password</h1>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
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
