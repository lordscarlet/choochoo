import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import { useLogout, useMe } from "../services/me";

export function Layout() {
  const me = useMe();
  const { logout, isPending } = useLogout();
  return <div>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography color="white" style={{ textDecoration: 'none' }} variant="h6" sx={{ flexGrow: 1 }} component={Link} to="/">
            Choo Choo Games
          </Typography>
          {me == null ?
            <Button color="inherit" component={Link} to="/app/users/login">Login</Button> :
            <Button color="inherit" onClick={logout} disabled={isPending}>Logout</Button>}
        </Toolbar>
      </AppBar>
    </Box>
    <Outlet />
  </div>;
}