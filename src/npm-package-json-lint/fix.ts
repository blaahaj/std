import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

import defaultPreferredNodeOrder from "./defaultPreferredNodeOrder.json" with { type: "json" };

type O = Record<string, unknown>;

// fix (std-fix-npmPkgJsonLint)
//
// Transform package.json as follows:
//
// - all objects are sorted by property name (alphabetically)
//   - except for the top level object, whose properties are sorted according to the defaultPreferredNodeOrder

const buildObject = (acc: O, [k, v]: [string, unknown]) => {
  acc[k] = v;
  return acc;
};

const buildObject2 = (entries: [string, unknown][]): O =>
  entries.reduce(buildObject, {});

const defaultStringComparator = (a: string, b: string) =>
  a < b ? -1 : a > b ? 1 : 0;

const sortObjectByKey = (
  data: O,
  comparator?: (a: string, b: string) => number,
): O =>
  buildObject2(
    Object.entries(data).toSorted((a, b) =>
      (comparator ?? defaultStringComparator)(a[0], b[0]),
    ),
  );

const transformValues = (data: O, fn: (a: unknown) => unknown) =>
  buildObject2(
    Object.entries(data).map(([k, v]) => [k, fn(v)] as [string, unknown]),
  );

const deepSortObjectsByKey = (data: unknown): unknown =>
  data instanceof Array
    ? data.map((item) => deepSortObjectsByKey(item))
    : data !== null && typeof data === "object"
      ? sortObjectByKey(transformValues(data as O, deepSortObjectsByKey))
      : data;

const dir = process.argv[2] ?? ".";
const filePath = join(dir, "package.json");
const oldContent = await readFile(filePath, "utf-8");
const originalData = JSON.parse(oldContent);

const defaultSortedData = deepSortObjectsByKey(originalData);

const compareTopLevelProperties = (a: string, b: string): number => {
  let i = defaultPreferredNodeOrder.indexOf(a);
  let j = defaultPreferredNodeOrder.indexOf(b);
  if (i < 0) i = defaultPreferredNodeOrder.length;
  if (j < 0) j = defaultPreferredNodeOrder.length;

  return i - j || defaultStringComparator(a, b);
};

const sortedData = sortObjectByKey(
  defaultSortedData as O,
  compareTopLevelProperties,
);

const newContent = JSON.stringify(sortedData, null, 2) + "\n";

if (newContent !== oldContent) {
  const tmpFile = `${filePath}.tmp`;
  await writeFile(tmpFile, newContent, "utf-8");
  await rename(tmpFile, filePath);
  console.log(`Updated ${filePath}`);
}
