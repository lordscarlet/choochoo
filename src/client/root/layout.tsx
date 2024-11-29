
import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, styled, Toolbar, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { Link, Outlet } from "react-router-dom";
import { UserRole } from "../../api/user";
import { FeedbackForm } from "../services/feedback/form";
import { useReportError } from '../services/feedback/report_error';
import { useLogout, useMe } from "../services/me";
import { isNetworkError } from '../services/network';
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
      <ErrorBoundary fallbackRender={({ resetErrorBoundary, error }) => <ResetError error={error} resetErrorBoundary={resetErrorBoundary} />}>
        <Outlet />
      </ErrorBoundary>
    </main>
    <FeedbackDialog isOpen={isFeedbackOpen} close={closeFeedback} />
  </div>;
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