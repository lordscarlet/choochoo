timestamp="$(date '+%Y%m%d%H%M%S')"
filename="$1"

if [[ -z "$filename" ]]; then
  echo "must provide a filename"
  exit
fi

read -r -d '' content <<  ENDOFMESSAGE
import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {
  // TODO: up. Try to limit one command per migration
  // otherwise, down calls are complicated if the up fails midway.
}
  
export const down: Migration = async ({ context: queryInterface }) => {
  // TODO: down
}
ENDOFMESSAGE

echo "$content" > "./src/migrations/${timestamp}_$filename.ts"