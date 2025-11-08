-- Insert sample restaurants
INSERT INTO public.restaurants (name, cuisine, location, price_range, address, emoji) VALUES
  ('Caru cu Bere', 'Romanian', 'Old Town', '€€€', 'Strada Doamnei 3-5', '🍺'),
  ('Trattoria Il Calcio', 'Italian', 'Floreasca', '€€', 'Strada Barbu Văcărescu 164', '🍝'),
  ('The Artist', 'French', 'Old Town', '€€€€', 'Strada Franceză 3', '🎨'),
  ('Hanu Berarilor', 'Romanian', 'Lipscani', '€€', 'Strada Smardan 32', '🍻'),
  ('Nor Sky Casual Restaurant', 'International', 'Baneasa', '€€€', 'Șoseaua București-Ploiești 42D', '🏙️')
ON CONFLICT DO NOTHING;

-- Insert sample events
-- Removed all placeholder events - admin will add real events via dashboard
