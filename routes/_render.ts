import type { RenderContext, RenderFn } from "$fresh/server.ts";

export function render(ctx: RenderContext, render: RenderFn) {
  ctx.lang = "ja";
  render();
}
