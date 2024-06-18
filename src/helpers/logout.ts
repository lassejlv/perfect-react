export const Logout = async (): Promise<boolean> => {
  const response = await fetch("/api/logout", {
    method: "DELETE",
  });

  if (!response.ok) return false;
  else return true;
};

export const VerifyEmail = async (): Promise<boolean> => {
  const response = await fetch("/api/verify-email", {
    method: "POST",
  });

  if (!response.ok) return false;
  else return true;
};
