
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import OffersSection from '@/components/OffersSection';
import ProductsSection from '@/components/ProductsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <OffersSection />
        <ProductsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
