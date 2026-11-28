// Publishes to LinkedIn through the Buffer GraphQL API (personal API key).
const ENDPOINT = 'https://api.buffer.com';

export async function publish({ apiKey, channelId, text, imageUrl, altText }) {
  const query = `mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess { post { id dueAt } }
      ... on MutationError { message }
    }
  }`;
  const input = {
    text, channelId, schedulingType: 'automatic', mode: 'shareNow',
    assets: [{ image: { url: imageUrl, metadata: { altText } } }],
  };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ query, variables: { input } }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.errors) throw new Error(`Buffer ${res.status}: ${JSON.stringify(j.errors || j).slice(0, 300)}`);
  const r = j.data?.createPost;
  if (!r?.post) throw new Error(`Buffer: ${r?.message || 'unknown error'}`);
  return r.post;
}
