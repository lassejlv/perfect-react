import React from "react";
import { User } from "@prisma/client";
import { Logout, VerifyEmail } from "../helpers/logout";
import { Link, useNavigate } from "react-router-dom";
import { Gauge, LogOut, MailWarning, Settings } from "lucide-react";
import toast from "react-hot-toast";

const sidebarItems: { name: string; path: string; icon: React.ReactNode }[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <Gauge className="inline" />,
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: <Settings className="inline" />,
  },
];

export default function Sidebar({ user, children }: { user: User; children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content p-5">
        <div className="block lg:hidden">
          <label htmlFor="my-drawer" className="btn">
            Open drawer
          </label>
        </div>

        {children}
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

        <ul className="menu p-4 w-80 min-h-full space-y-3 bg-base-200 text-base-content">
          <h1 className="text-2xl font-bold text-center">Perfect React</h1>
          {/* Sidebar content here */}
          {sidebarItems.map((item) => (
            <li>
              <Link to={item.path} className="text-white">
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="fixed bottom-0 w-80 p-4 bg-base-200 text-base-content">
          <div className="dropdown dropdown-top">
            <div tabIndex={0} role="button" className="btn btn-active m-1">
              <img src={user.avatar!} alt="avatar" className="w-8 h-8 rounded-full" />
              <span>{user.username}</span>
              {!user.verified && <span className="badge badge-error">Unverified</span>}
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li
                onClick={async () => {
                  const logout = await Logout();

                  if (!logout) return toast.error("Already logged out");
                  else {
                    toast.success("Logout successful");
                    return navigate("/login");
                  }
                }}
              >
                <a>
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </a>
              </li>
              {!user.verified && (
                <li
                  onClick={() => {
                    const emailSend = VerifyEmail();
                    if (!emailSend) return toast.error("Something went wrong");
                    else return toast.success("Succes! Check your email for verification link.");
                  }}
                >
                  <a>
                    <MailWarning className="w-5 h-5 mr-2" />
                    Verify now
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
