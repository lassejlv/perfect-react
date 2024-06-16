import useFetch from "react-fetch-hook";

export default function Home() {
  const { isLoading, data, error } = useFetch("/api");

  if (isLoading) return <h1 className="text-3xl font-bold underline text-blue-500">Loading...</h1>;
  if (error) return <h1 className="text-3xl font-bold underline text-red-500">Error: {error.message}</h1>;
  if (!data) return null;

  console.log(data);

  return <h1 className="text-3xl font-bold underline text-green-500">Hello world!</h1>;
}
