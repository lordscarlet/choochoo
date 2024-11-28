import { default as Button } from "@mui/material/Button";
import { Link } from "react-router-dom";
import { banner } from "./banner.module.css";

export function Banner() {
  return <>
    {/* <WaitlistBanner /> */}
  </>;
}

export function WaitlistBanner() {
  return <div className={banner}>
    You are currently on a waitlist and won't be able to create or join games.
    <Button component={Link} to="/app/users/invitation">Enter Invitation Code</Button>
  </div>
}