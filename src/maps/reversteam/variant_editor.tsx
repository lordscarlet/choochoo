import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import { ChangeEvent, useCallback } from "react";
import { ReversteamVariantConfig } from "../../api/variant_config";
import { VariantConfigProps } from "../view_settings";

export function ReversteamVariantEditor({
  config: untypedConfig,
  setConfig,
  isPending,
  errors,
}: VariantConfigProps) {
  const config = untypedConfig as ReversteamVariantConfig;

  const setConfigInternal = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setConfig({ ...config, baseRules: e.target.checked });
    },
    [setConfig, config],
  );

  return (
    <FormControl error={errors?.["variant.baseRules"] != null}>
      <FormControlLabel
        sx={{ m: 1, minWidth: 80 }}
        label="Use base map rules (not reversed)"
        control={
          <Checkbox
            checked={config.baseRules}
            value={config.baseRules}
            disabled={isPending}
            onChange={setConfigInternal}
          />
        }
      />
      <FormHelperText>{errors?.["variant.baseRules"]}</FormHelperText>
    </FormControl>
  );
}
