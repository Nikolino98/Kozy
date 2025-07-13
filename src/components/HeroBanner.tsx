
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Descubre el Confort",
      subtitle: "Productos de belleza que transforman tu rutina diaria",
      description: "Encuentra los mejores productos para cuidar tu piel y realzar tu belleza natural",
      image: "/images/slider1.jpg",
      cta: "Ver Belleza",
      badge: "Nuevo"
    },
    {
      title: "Tecnología Inteligente",
      subtitle: "Electrónicos y accesorios para tu estilo de vida",
      description: "Auriculares, gadgets y tecnología que se adapta a tu día a día",
      image: "/images/slider3.jpeg",
      cta: "Ver Electrónicos",
      badge: "Oferta"
    },
    {
      title: "Estilo Personal",
      subtitle: "Bisutería y accesorios únicos",
      description: "Expresa tu personalidad con nuestra colección de joyas y accesorios",
      image: "/images/slider2.jpg",
      cta: "Ver Accesorios",
      badge: "Trending"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-kozy-cream via-background to-kozy-cream/50">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 transition-all duration-700 ease-in-out transform">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-kozy-warm/10 text-kozy-warm text-sm font-medium transition-opacity duration-700">
              <Sparkles className="w-4 h-4 mr-2" />
              {slides[currentSlide].badge}
            </div>
            
            <div className="space-y-4 transition-all duration-700 ease-in-out">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight transition-all duration-700">
                {slides[currentSlide].title}
                <span className="block text-kozy-warm mt-2">
                  {slides[currentSlide].subtitle.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="block text-2xl lg:text-3xl font-normal text-muted-foreground mt-2">
                  {slides[currentSlide].subtitle.split(' ').slice(2).join(' ')}
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {slides[currentSlide].description}
              </p>
            </div>

            
            {/* Star Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-kozy-warm text-kozy-warm" />
                ))}
              </div>
              <span className="text-muted-foreground">4.9/5 de nuestros clientes</span>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted shadow-2xl">
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover transition-all duration-700 ease-in-out transform hover:scale-105"
              />
              
              {/* Floating Elements */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg animate-bounce-gentle">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">En Stock</span>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 bg-kozy-warm text-white rounded-2xl px-4 py-2 shadow-lg animate-bounce-gentle" style={{ animationDelay: '1s' }}>
                <span className="text-sm font-bold">-30% OFF</span>
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-kozy-warm' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-kozy-warm/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-kozy-orange/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroBanner;
