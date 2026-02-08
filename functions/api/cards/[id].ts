interface Env {
  CARDS: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { id } = context.params;

  if (!id || typeof id !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid card ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate ID format (5 alphanumeric characters)
  if (!/^[a-zA-Z0-9]{5}$/.test(id)) {
    return new Response(JSON.stringify({ error: 'Invalid card ID format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const card = await context.env.CARDS.get(id);

  if (!card) {
    return new Response(JSON.stringify({ error: 'Card not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(card, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
