import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Confirm } from "semantic-ui-react";
import * as styles from "./confirm.module.css";

interface ConfirmOptions {
  confirmButton?: "Confirm Delivery";
  cancelButton?: "Cancel";
}

interface ConfirmOptionsInternal extends ConfirmOptions {
  content: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

export type ConfirmCallback = (
  content: string,
  options?: ConfirmOptions,
) => Promise<boolean>;

const ConfirmOpenContext = createContext<ConfirmCallback>(async () => false);

export function useConfirm() {
  return useContext(ConfirmOpenContext);
}

export function DialogsProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptionsInternal | undefined>(
    undefined,
  );

  const confirm: ConfirmCallback = useCallback(
    async (content: string, options?: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setOptions({
          ...options,
          content, //<div style={{ color: "black" }}>{content}</div>,
          onCancel: () => resolve(false),
          onConfirm: () => resolve(true),
        });
      }).finally(() => setOptions(undefined)),
    [setOptions],
  );

  return (
    <ConfirmOpenContext.Provider value={confirm}>
      {children}
      <Confirm
        open={options != null}
        content={options?.content}
        onCancel={options?.onCancel}
        onConfirm={options?.onConfirm}
        confirmButton={options?.confirmButton}
        cancelButton={options?.cancelButton}
        size="large"
        className={styles.confirm}
      />
    </ConfirmOpenContext.Provider>
  );
}
