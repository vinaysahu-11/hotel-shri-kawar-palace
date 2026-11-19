/**
 * Vercel Serverless Function: Place Reviews
 * Property: Hotel Shri Kawar Palace (06-hotel-shri-kawar-palace)
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      configured: false,
      message: "GOOGLE_MAPS_API_KEY is not configured.",
      reviews: [],
      fallback: true
    });
  }

  try {
    const googleUrl = 'https://places.googleapis.com/v1/places:searchText';
    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews'
      },
      body: JSON.stringify({
        textQuery: "Hotel Shri Kanwar Palace Civil Line Rajnandgaon Chhattisgarh",
        maxResultCount: 1
      })
    });

    const data = await response.json();
    const place = data.places ? data.places[0] : null;

    if (!place) {
      return res.status(200).json({
        configured: true,
        reviews: [],
        rating: null,
        userRatingCount: 0
      });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=900, stale-while-revalidate=86400');

    return res.status(200).json({
      configured: true,
      rating: place.rating || null,
      userRatingCount: place.userRatingCount || 0,
      googleMapsUri: place.googleMapsUri || "https://maps.app.goo.gl/72dAocncPhtKC7yGA",
      reviews: place.reviews || []
    });

  } catch (err) {
    return res.status(500).json({ error: err.message, fallback: true });
  }
};
