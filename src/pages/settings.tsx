import Spinner from "../components/Spinner";
import useAuth from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";

export default function Settings() {
  const navigate = useNavigate();
  const { loading, data, error } = useAuth();

  if (loading) return <Spinner />;
  if (error) navigate("/login");
  if (!data) return navigate("/login");

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const schema = z.object({
      email: z.string().email(),
      confirm: z.string(),
    });

    const parsedData = schema.safeParse(data);
    if (!parsedData.success) return toast.error("Invalid data");

    if (parsedData.data.confirm !== "on") return toast.error("Please confirm that you want to log out of all sessions");

    await fetch("/api/logout", { method: "DELETE" });

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
    });

    if (!response.ok) return toast.error("An error occurred");
    else {
      navigate("/login");
      return toast.success("Check your email for a password reset link");
    }
  };

  const updateUsername = async (e: React.FocusEvent<HTMLInputElement>) => {
    const response = await fetch("/api/update-user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: e.target.value }),
    });

    if (!response.ok) return toast.error("Username already taken or an error occurred");
    else return toast.success("Username updated");
  };

  return (
    <Sidebar user={data}>
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="flex flex-col space-y-4">
        <label className="flex flex-col">
          <span>Email</span>
          <input type="email" className="input input-bordered input-sm" disabled defaultValue={data.email} />
        </label>

        <label className="flex flex-col">
          <span>Username</span>
          <input
            type="text"
            name="username"
            className="input input-bordered input-sm"
            defaultValue={data.username}
            onBlur={(e) => updateUsername(e)}
          />
        </label>
      </div>

      <form className="flex flex-col space-y-4 my-5" onSubmit={handlePasswordSubmit}>
        <label className="flex flex-col">
          <span className="mb-2">Change Password</span>
          <input type="hidden" name="email" value={data.email} />

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">
                I confirm that i get logged out of all my sessions when i click the button below
              </span>
              <input type="checkbox" name="confirm" className="checkbox" />
            </label>
          </div>

          <button type="submit" className="btn btn-sm btn-neutral">
            Change Password
          </button>
        </label>
      </form>

      <form className="flex flex-col space-y-4 my-5">
        <label className="flex flex-col">
          <span className="mb-2">Danger Zone</span>
          <input type="hidden" name="email" value={data.email} />
          <p className="text-red-500">This action is irreversible. You will lose all your data.</p>
          <button type="submit" className="btn btn-sm btn-error">
            Delete Account
          </button>
        </label>
      </form>
    </Sidebar>
  );
}
