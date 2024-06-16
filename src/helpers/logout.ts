import toast from "react-hot-toast";

export const logout = async () => {
  const response = await fetch("/api/logout", {
    method: "DELETE",
  });

  if (!response.ok) return toast.error("Already logged out");

  const json = await response.json();
  return toast.success(json.message);
};
