// Catch-all function to handle 404 redirects
// This only runs for paths that don't match existing static files or named functions
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // For GET requests to undefined paths, redirect to homepage
  if (request.method === 'GET') {
    return Response.redirect(url.origin + '/', 301);
  }
  
  // For non-GET requests to undefined paths, return 404
  return new Response('Not Found', { status: 404 });
}
