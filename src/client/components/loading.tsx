import { CircularProgress } from "@mui/material";

import { loadingContainer } from './loading.module.css';

export function Loading() {
  return <div className={loadingContainer}>
    <CircularProgress size={80} />
  </div>;
}