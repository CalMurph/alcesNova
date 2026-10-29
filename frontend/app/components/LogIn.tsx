"use client";

import { useRouter } from "next/navigation";

export default function LogIn() {
  const router = useRouter();

  async function handleLogIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const res = await fetch("/api/backend/v1/users/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!res.ok) {
      console.error("Login failed");
      return;
    }

    router.replace("/home");
  }

  return (
    <main className="flex w-full justify-center min-h-screen px-4 py-8 sm:px-8">
      <div className="">
        <div className="flex gap-4 flex-col">
          <h1 className="font-chalet w-full text-center text-white text-4xl font-semibold leading-normal ">
            Log In to <span className="font-dune text-3xl">Alces Nova</span>
          </h1>
          <form onSubmit={handleLogIn} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-xl">Username</label>

              <input
                id="username"
                name="username"
                required
                type="text"
                className="bg-white text-black  border rounded-lg h-8 px-2 font-bold"
              ></input>
            </div>
            <div className="flex flex-col">
              <label className="text-xl">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                className="bg-white text-black border rounded-lg h-8 px-2 font-bold"
              ></input>
            </div>
            <button
              type="submit"
              className="
    relative cursor-pointer isolate overflow-hidden
    h-12 rounded-full border px-6 font-bold
    transition-colors duration-500 hover:border-transparent
    before:absolute before:inset-0 before:-z-10
    before:origin-left before:scale-x-0
    before:bg-gradient-to-r
    before:from-blue-900 before:via-purple-900 before:to-pink-900
    before:transition-transform before:duration-1000
    hover:before:scale-x-100
  "
            >
              Log In
            </button>{" "}
          </form>
        </div>
      </div>
    </main>
  );
}
