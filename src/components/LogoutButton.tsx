import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { captureLogoutStart, consumeLogoutReturnTo } from "../lib/returnTo";

export const LogoutButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { logout, isAuthenticated } = useAuth0();
  if (!isAuthenticated) return null;

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        // Remember where we started logout so we can land back there
        captureLogoutStart();
        const rt = consumeLogoutReturnTo() ?? window.location.pathname;
        logout({ logoutParams: { returnTo: window.location.origin + rt } });
      }}
    >
      Log out
    </button>
  );
};
