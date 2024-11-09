
import { MapSettings } from '../engine/game/map_settings';
import { assert } from '../utils/validate';
import { RustBeltMapSettings } from './rust_belt';


export class MapRegistry {
  private readonly maps = new Map<string, MapSettings>();

  constructor() {
    this.add(new RustBeltMapSettings());
  }

  values(): Iterable<MapSettings> {
    return this.maps.values();
  }

  add(map: MapSettings): void {
    assert(!this.maps.has(map.key), `duplicate maps with key ${map.key}`);
    this.maps.set(map.key, map);
  }

  get(key: string): MapSettings {
    assert(this.maps.has(key), `unfound maps with key ${key}`);
    return this.maps.get(key)!;
  }
}
