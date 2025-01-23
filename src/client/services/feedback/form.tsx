import { Box, Button, FormControl, FormHelperText } from "@mui/material";
import { FormEvent, useCallback } from "react";
import { useTextInputState } from "../../utils/form_state";
import { useSubmitFeedback } from "./submit";

interface FeedbackFormProps {
  errorId?: number;
  onSubmit?: () => void;
}

export function FeedbackForm({ onSubmit, errorId }: FeedbackFormProps) {
  const [message, setMessage, setRawMessage] = useTextInputState();
  const { submitFeedback, validationError, isPending } = useSubmitFeedback();

  const onSubmitInternal = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitFeedback({ message, errorId, url: window.location.toString() }, () => {
      setRawMessage('');
      onSubmit?.();
    });
  }, [message, errorId, submitFeedback]);

  return <Box
    component="form"
    sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
    noValidate
    autoComplete="off"
    onSubmit={onSubmitInternal}
  >
    <FormControl sx={{ m: 1, minWidth: 80 }} error={validationError?.message != null}>
      <textarea aria-label="Submit message..." style={{ height: 200 }} placeholder="Submit message..." value={message} onChange={setMessage} />
      {validationError?.message && <FormHelperText>{validationError?.message}</FormHelperText>}
    </FormControl>
    <div>
      <Button type="submit" disabled={isPending}>Submit</Button>
    </div>
  </Box >;
}