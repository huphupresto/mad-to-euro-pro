const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the free exchangerate-api (no key needed)
    const response = await fetch('https://open.er-api.com/v6/latest/EUR');
    const data = await response.json();

    if (!response.ok || data.result !== 'success') {
      throw new Error('Failed to fetch exchange rate');
    }

    const madRate = data.rates?.MAD;
    if (!madRate) {
      throw new Error('MAD rate not found');
    }

    console.log('Fetched EUR/MAD rate:', madRate);

    return new Response(
      JSON.stringify({ success: true, rate: madRate, timestamp: data.time_last_update_utc }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching rate:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
