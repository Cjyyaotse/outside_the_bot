// declarations.d.ts
import * as React from "react";
import type { SearchBoxProps } from "@mapbox/search-js-react";

declare module "@mapbox/search-js-react" {
  // Override just the type so TS accepts JSX usage
  export const SearchBox: React.FC<SearchBoxProps>;
}
