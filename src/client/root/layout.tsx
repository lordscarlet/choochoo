
import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, styled, Toolbar, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { UserRole } from "../../api/user";
import { FeedbackForm } from "../services/feedback/form";
import { useLogout, useMe } from "../services/me";
import { Banner } from "./banner";
import { main } from './layout.module.css';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export function Layout() {
  const me = useMe();
  const { logout, isPending } = useLogout();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const openFeedback = useCallback(() => {
    setIsFeedbackOpen(true);
  }, [setIsFeedbackOpen]);
  const closeFeedback = useCallback(() => {
    setIsFeedbackOpen(false);
  }, [setIsFeedbackOpen]);
  return <div>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography color="white" style={{ textDecoration: 'none' }} variant="h6" sx={{ flexGrow: 1 }} component={Link} to="/">
            Choo Choo Games
          </Typography>
          {me != null && me.role == UserRole.enum.ADMIN &&
            <Button color="inherit" component={Link} to="/app/admin">Admin</Button>}
          {me != null &&
            <Button color="inherit" onClick={openFeedback}>Submit Feedback</Button>}
          {me == null ?
            <Button color="inherit" component={Link} to="/app/users/login">Login</Button> :
            <Button color="inherit" onClick={logout} disabled={isPending}>Logout</Button>}
        </Toolbar>
      </AppBar>
    </Box>
    <Offset />
    <Banner />
    <main className={main}>
      <Outlet />
    </main>
    <FeedbackDialog isOpen={isFeedbackOpen} close={closeFeedback} />
  </div>;
}

interface FeedbackDialog {
  isOpen: boolean;
  close(): void;
}

export function FeedbackDialog({ isOpen, close }: FeedbackDialog) {
  return <Dialog
    open={isOpen}
    onClose={close}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle>
      Submit feedback
    </DialogTitle>
    <IconButton
      aria-label="close"
      onClick={close}
      sx={() => ({
        position: 'absolute',
        right: 8,
        top: 8,
        color: 'grey',
      })}
    >
      <CloseIcon />
    </IconButton>
    <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
      <FeedbackForm onSubmit={close} />
    </DialogContent>
  </Dialog>;
}