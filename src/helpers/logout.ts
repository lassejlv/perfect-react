export const Logout = async (): Promise<boolean> => {
  const response = await fetch("/api/logout", {
    method: "DELETE",
  });

  if (!response.ok) return false;

  return true;
};
