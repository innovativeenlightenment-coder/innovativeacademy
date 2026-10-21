import { LEVELS } from "@/utils/level_config";

export function getLevelByPoints(points: number) {
  return LEVELS.find(
    (l) => points >= l.minPoints && points <= l.maxPoints
  )!;
}
