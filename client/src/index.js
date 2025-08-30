export default {
  async fetch(request, env, ctx) {
    let res = await env.ASSETS.fetch(request);

    // Only fall back on 404 (for React Router SPA paths)
    if (
      res.status === 404 &&
      request.headers.get('accept')?.includes('text/html')
    ) {
      const url = new URL(request.url);
      res = await env.ASSETS.fetch(`${url.origin}/index.html`);
    }

    return res;
  },
};
