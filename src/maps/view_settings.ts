import { ReactElement, ReactNode } from "react";
import { VariantConfig } from "../api/variant_config";
import { RowFactory } from "../client/game/final_overview_row";
import { ClickTarget } from "../client/grid/click_target";
import { MapSettings } from "../engine/game/map_settings";
import { InterceptMoveModalProps } from "../engine/move/interceptor";
import { Action } from "../engine/state/action";

export interface VariantConfigProps {
  config: Partial<VariantConfig>;
  isPending: boolean;
  setConfig: (c: VariantConfig) => void;
  errors?: Record<string, string>;
}

export interface RulesProps {
  variant: VariantConfig;
}

export interface TexturesProps {
  size: number;
  clickTargets?: Set<ClickTarget>;
}

export interface MapViewSettings extends MapSettings {
  getInitialVariantConfig?(): VariantConfig;
  getVariantConfigEditor?(props: VariantConfigProps): ReactNode;

  additionalSliders?: Array<() => ReactElement>;
  getVariantString?(variant: VariantConfig): string[] | undefined;
  getMapRules(props: RulesProps): ReactElement;
  getActionDescription?(action: Action): string | undefined;
  getTexturesLayer?(props: TexturesProps): ReactNode;
  getFinalOverviewRows?(): RowFactory[];
  getActionCaption?(action: Action): string | undefined;
  moveGoodsMessage?(): string | undefined;
  moveInterceptModal?(props: InterceptMoveModalProps): ReactNode;
}
