# This script takes in a command and a number of runs, and runs the command N times. It only reports a failure if all runs fail.
set -e

COMMAND="$1"
RUNS="${2:-3}"

failures=0;
echo "running $RUNS times";

for i in $(seq 1 $RUNS); do
  if ! eval "$COMMAND"; then
    failures=$((failures + 1));
  fi
  echo ""
  echo "=================="
  echo "Failed $failures/$i"
  echo "=================="
  echo ""
done

if [ "$failures" -lt "$RUNS" ]; then
  exit 0;
else
  exit 1;
fi