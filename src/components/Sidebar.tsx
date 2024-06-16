import React from "react";
import { User } from "../../.prismo/types";
import { logout } from "../helpers/logout";

export default function Sidebar({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{children}</div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          {/* Sidebar content here */}
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>

        <div className="fixed bottom-0 w-80 p-4 bg-base-200 text-base-content">
          <div className="dropdown dropdown-top">
            <div tabIndex={0} role="button" className="btn btn-active m-1">
              <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
              <span>{user.username}</span>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li onClick={() => logout()}>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
