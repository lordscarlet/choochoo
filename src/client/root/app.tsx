import { Button, createTheme, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { DialogsProvider, NotificationsProvider } from "@toolpad/core";
import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Loading } from "../components/loading";
import { tsr } from '../services/client';
import { Router } from "./routes";


const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export function App() {
  const queryClient = useMemo(() => new QueryClient(), [1]);
  const { reset } = useQueryErrorResetBoundary();

  return <Suspense fallback={<Loading />}>
    <ThemeProvider theme={theme}>
      <DialogsProvider>
        <NotificationsProvider>
          <ErrorBoundary onReset={reset} fallbackRender={({ resetErrorBoundary }) => <ResetError resetErrorBoundary={resetErrorBoundary} />}>
            <QueryClientProvider client={queryClient}>
              <tsr.ReactQueryProvider>
                <Router />
              </tsr.ReactQueryProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </NotificationsProvider>
      </DialogsProvider>
    </ThemeProvider>
  </Suspense>;
}

function ResetError({ resetErrorBoundary }: { resetErrorBoundary(): void }) {
  console.log('rendering error');
  return <div>
    There was an error!
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </div>;
}