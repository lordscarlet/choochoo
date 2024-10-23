import { Button } from "@mui/material";
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { NotificationsProvider } from "@toolpad/core";
import { ReactNode, Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { tsr } from '../services/client';

export function App({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), [1]);
  const { reset } = useQueryErrorResetBoundary();

  return <Suspense fallback={<Loading />}>
    <NotificationsProvider>
      <ErrorBoundary onReset={reset} fallbackRender={({ resetErrorBoundary }) => <ResetError resetErrorBoundary={resetErrorBoundary} />}>
        <QueryClientProvider client={queryClient}>
          <tsr.ReactQueryProvider>
            {children}
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