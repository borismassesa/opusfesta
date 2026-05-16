const articles = [
  { id: 1, tag: 'Bridal Wear', title: '15 stunning wedding dress trends for 2026 brides', excerpt: 'Make your big day even more special with our curated selection of breathtaking bridal gowns that capture the modern romance.', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
  { id: 2, tag: 'Jewelry Guides', title: 'How to pick the perfect engagement ring', excerpt: 'From diamond cuts and clarity to selecting the perfect band style — get ready to choose an engagement ring that lasts forever.', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
  { id: 3, tag: 'Suiting', title: 'The ultimate guide to groom and groomsmen attire', excerpt: 'Get to know the artistry behind a perfectly tailored suit, from fabric selection to the sharpest lapel styles.', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
]

export function BlogSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
      <h2 className="text-2xl font-serif font-medium text-gray-900 mb-8 flex items-center group cursor-pointer w-fit">
        Fresh from the blog <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="group cursor-pointer flex flex-col items-center border border-gray-200 hover:shadow-lg transition-shadow bg-white rounded-t-2xl">
            <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden rounded-t-2xl">
              <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 md:p-8 flex flex-col flex-grow items-center text-center">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">{article.tag}</span>
              <h3 className="font-serif text-xl text-gray-900 mb-3 group-hover:underline">{article.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed w-[90%]">{article.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
