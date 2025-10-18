import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";

export function AuthGuard<P>(Component: React.ComponentType<P>) {
  return withAuthenticationRequired(Component, {
    onRedirecting: () => (
      <div style={{display:"grid",placeItems:"center",height:"60vh"}}>
        <div>Loading secure page…</div>
      </div>
    ),
  });
}
