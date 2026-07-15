export default function Gallery() {
  const photos = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1621801306185-1175654ee0d9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518115682855-3d842b1007ee?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <div className="max-w-container-max mx-auto px-margin-page">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <h2 className="font-display-md text-4xl lg:text-5xl mb-6">Gallery</h2>
        <p className="text-secondary text-sm lg:text-base leading-relaxed font-light italic font-display-md">
          A glimpse into our favorite moments together.
        </p>
      </div>
      
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
        {photos.map((src, index) => (
          <div key={index} className="break-inside-avoid overflow-hidden group rounded-2xl shadow-sm mb-8">
            <img 
              src={src} 
              alt={`Gallery image ${index + 1}`} 
              className="w-full h-auto object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105 block"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
