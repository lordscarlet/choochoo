import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import { useLogout, useMe } from "../services/me";

export function Layout() {
  const me = useMe();
  const { logout, isPending } = useLogout();
  return <div>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Steam Ages
          </Typography>
          {me == null ?
            <Button color="inherit" component={Link} to="/users/login">Login</Button> :
            <Button color="inherit" onClick={logout} disabled={isPending}>Logout</Button>}
        </Toolbar>
      </AppBar>
    </Box>
    <Outlet />
  </div>;
}