-- Insert default coffee options
INSERT INTO coffee_options (id, name, price, description) VALUES
  ('arabica-blend', 'Arabica House Blend', 45000, 'Our signature blend with notes of chocolate and caramel'),
  ('robusta-special', 'Robusta Special', 40000, 'Bold and strong coffee with earthy undertones'),
  ('kopi-luwak', 'Kopi Luwak Premium', 85000, 'Rare and exotic coffee with unique processing method'),
  ('java-preanger', 'Java Preanger', 55000, 'Traditional Indonesian coffee with earthy undertones'),
  ('toraja-highland', 'Toraja Highland', 65000, 'Full-bodied coffee from the mountains of Sulawesi')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;
