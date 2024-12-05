import { assert } from "../../utils/validate";


export class Lifecycle {
  static singleton = new Lifecycle();

  private started = false;
  private readonly listeners: Array<() => void> = [];

  private constructor() { }

  onStart(listener: () => void) {
    this.listeners.push(listener);
  }

  start(): void {
    assert(!this.started, 'cannot add listeners after starting');
    this.started = true;
    for (const listener of this.listeners) {
      listener();
    }
  }
}