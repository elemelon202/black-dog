Geocoder.configure(
  # Use Nominatim (OpenStreetMap) - free, no API key required
  lookup: :nominatim,

  # Set a proper user agent for Nominatim (required)
  http_headers: { "User-Agent" => "BlackDogExpress/1.0 (contact@blackdogexpress.co.uk)" },

  # Timeouts
  timeout: 5,

  # Cache results
  cache: Rails.cache,
  cache_options: { expires_in: 1.week },

  # Units
  units: :km,

  # Language for results
  language: :en
)
