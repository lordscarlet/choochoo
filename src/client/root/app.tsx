import { Button } from "@mui/material";
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { NotificationsProvider } from "@toolpad/core";
import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { tsr } from '../services/client';
import { Router } from "./routes";

export function App() {
  const queryClient = useMemo(() => new QueryClient(), [1]);
  const { reset } = useQueryErrorResetBoundary();

  return <Suspense fallback={<Loading />}>
    <NotificationsProvider>
      <ErrorBoundary onReset={reset} fallbackRender={({ resetErrorBoundary }) => <ResetError resetErrorBoundary={resetErrorBoundary} />}>
        <QueryClientProvider client={queryClient}>
          <tsr.ReactQueryProvider>
            <Router />
          </tsr.ReactQueryProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </NotificationsProvider>
  </Suspense>;
}

function Loading() {
  return <div>Loading...</div>;
}

function ResetError({ resetErrorBoundary }: { resetErrorBoundary(): void }) {
  return <div>
    There was an error!
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </div>;
}