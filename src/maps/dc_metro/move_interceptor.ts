import { MoveInterceptor } from "../../engine/move/interceptor";
import { MoveData } from "../../engine/move/move";
import { DcMoveData } from "./move";

export class DcMoveInterceptor extends MoveInterceptor {
  public shouldInterceptMove(moveData: MoveData, _cityName: string): boolean {
    if (moveData.path.length > 1) {
      return true;
    }
    (moveData as DcMoveData).goods = [];
    return false;
  }
}
