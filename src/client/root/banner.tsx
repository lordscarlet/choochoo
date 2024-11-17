import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { UserRole } from "../../api/user";
import { useMe } from "../services/me";
import { banner } from "./banner.module.css";

export function Banner() {
  return <>
    <WaitlistBanner />
  </>;
}

export function WaitlistBanner() {
  const user = useMe();
  if (user == null || user.role !== UserRole.enum.WAITLIST) return <></>;

  return <div className={banner}>
    You are currently on a waitlist and won't be able to create or join games.
    <Button component={Link} to="/app/users/invitation">Enter Invitation Code</Button>
  </div>
}