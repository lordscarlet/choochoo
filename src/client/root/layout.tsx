
import AccountCircle from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import { default as DarkMode } from '@mui/icons-material/DarkMode';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import FeedbackOutlined from '@mui/icons-material/FeedbackOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import ManageAccounts from '@mui/icons-material/ManageAccounts';
import { AppBar, Button, Dialog, DialogContent, DialogTitle, IconButton, ListItemIcon, Menu, MenuItem, MenuList, styled, Toolbar, Typography, useColorScheme, useMediaQuery } from "@mui/material";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { Link, Outlet } from "react-router-dom";
import { UserRole } from "../../api/user";
import { Loading } from '../components/loading';
import { FeedbackForm } from "../services/feedback/form";
import { useReportError } from '../services/feedback/report_error';
import { useLogout, useMe } from "../services/me";
import { isNetworkError } from '../services/network';
import { Banner } from "./banner";
import * as styles from './layout.module.css';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export function Layout() {
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
  const [adminAnchorEl, setAdminAnchorEl] = useState<HTMLElement | undefined>(undefined);
  const me = useMe();
  const { logout, isPending: isLogoutPending } = useLogout();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const closeFeedback = useCallback(() => {
    setIsFeedbackOpen(false);
  }, [setIsFeedbackOpen]);

  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, [setAnchorEl]);

  const closeMenu = useCallback(() => {
    setAnchorEl(undefined);
  }, [setAnchorEl]);

  const openAdminMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAdminAnchorEl(event.currentTarget);
  }, [setAdminAnchorEl]);

  const closeAdminMenu = useCallback(() => {
    setAdminAnchorEl(undefined);
  }, [setAdminAnchorEl]);

  const logoutClick = useCallback(() => {
    logout();
    closeMenu();
  }, [logout, closeMenu]);
  const openFeedback = useCallback(() => {
    setIsFeedbackOpen(true);
    closeMenu();
  }, [setIsFeedbackOpen]);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const darkModeEnabled = mode === 'dark' ||
    (prefersDarkMode && mode === 'system');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkModeEnabled);
  }, [darkModeEnabled]);

  return <>
    <AppBar position="fixed">
      <Toolbar>
        <Typography color="white" style={{ textDecoration: 'none' }} variant="h6" sx={{ flexGrow: 1 }} component={Link} to="/">
          Choo Choo Games
        </Typography>
        {me == null &&
          <Button color="inherit" component={Link} to="/app/users/login">Login</Button>}

        {me?.role == UserRole.enum.ADMIN && <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={openAdminMenu}
          color="inherit"
        >
          <ManageAccounts />
        </IconButton>}

        <Menu
          id="menu-appbar"
          anchorEl={adminAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(adminAnchorEl)}
          onClose={closeAdminMenu}
        >
          <MenuItem>Dark mode: {mode ?? 'undefined'}</MenuItem>
          <MenuItem>Prefers dark mode: {prefersDarkMode ? 'true' : 'false'}</MenuItem>
          <MenuItem>Dark mode enabled: {darkModeEnabled ? 'true' : 'false'}</MenuItem>
          <MenuItem component={Link} onClick={closeAdminMenu} to="/app/admin/create-invite">Create Invitation</MenuItem>
          <MenuItem component={Link} onClick={closeAdminMenu} to="/app/admin/feedback">View Feedback</MenuItem>
          <MenuItem component={Link} onClick={closeAdminMenu} to="/app/admin/users">View users</MenuItem>
        </Menu>

        {me != null && <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={openMenu}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>}
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
        >
          <MenuList>
            <MenuItem onClick={() => { setMode(darkModeEnabled ? 'light' : 'dark'); closeMenu(); }}>
              <ListItemIcon>
                {darkModeEnabled ? <DarkMode fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
              </ListItemIcon>
              Dark Mode
            </MenuItem>
            <MenuItem onClick={openFeedback}>
              <ListItemIcon>
                <FeedbackOutlined fontSize="small" />
              </ListItemIcon>
              Submit feedback
            </MenuItem>
            <MenuItem onClick={logoutClick} disabled={isLogoutPending}>
              <ListItemIcon>
                <LogoutOutlined fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Toolbar>
    </AppBar>
    <Offset />
    <Banner />
    <main className={`${styles.main}`}>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary fallbackRender={({ resetErrorBoundary, error }) => <ResetError error={error} resetErrorBoundary={resetErrorBoundary} />}>
          <Outlet />
        </ErrorBoundary>
      </Suspense>
    </main>
    <Footer />
    <FeedbackDialog isOpen={isFeedbackOpen} close={closeFeedback} />
  </>;
}

function Footer() {
  return <footer className={styles.footer}>
    <a href="/terms.html" target="_blank">Terms of Service</a>
    {` • `}
    <a href="/privacy.html" target="_blank">Privacy Policy</a>
  </footer>;
}

function ResetError({ error, resetErrorBoundary }: { error: unknown, resetErrorBoundary(): void }) {
  const me = useMe();
  const { reportError, isPending, errorId } = useReportError();
  const [submittedForm, setSubmittedForm] = useState(false);
  useEffect(() => {
    if (me == null || isPending || errorId != null) return;
    if (error == null || isNetworkError(error)) return;
    if (error instanceof Error) {
      reportError({ url: window.location.toString(), stack: error.stack, errorMessage: error.message });
      return;
    }
    if (typeof error === 'string') {
      reportError({ url: window.location.toString(), errorMessage: error });
      return;
    }
    reportError({ url: window.location.toString(), errorMessage: `Unexpected error message: ${error}` });
  }, [me, error, reportError, isPending, errorId]);

  const close = useCallback(() => {
    setSubmittedForm(true);
  }, [setSubmittedForm]);

  return <div>
    <p>Oops! We hit an error. We're looking into it, don't worry.</p>
    <p>You can try refreshing the page and see if it happens again. If that doesn't work, sit tight! This is a work in progress.</p>
    {!submittedForm && errorId != null && <p>It would be really helpful if you submitted a report describing what you were attempting to do.</p>}
    {!submittedForm && errorId != null && <FeedbackForm onSubmit={close} errorId={errorId} />}
    {submittedForm && <p>Thanks! We'll look into it ASAP!</p>}
    <Button onClick={resetErrorBoundary}>Reload</Button>
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