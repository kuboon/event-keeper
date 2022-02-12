/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { server } from "./deps.ts";
import routes from "./routes.gen.ts";

await server.start(routes);
