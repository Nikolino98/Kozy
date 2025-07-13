
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-6 h-6 border-2 border-kozy-warm/30 border-t-kozy-warm rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeCategories = categories.filter(category => category.is_active);

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onCategoryChange('all')}
        className={`text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 h-auto rounded-full transition-all duration-300 ${
          selectedCategory === 'all' 
            ? 'kozy-gradient text-white shadow-lg' 
            : 'border-kozy-warm/30 text-kozy-warm hover:bg-kozy-warm/10 hover:border-kozy-warm'
        }`}
      >
        Todos
      </Button>
      
      {activeCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id)}
          className={`text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 h-auto rounded-full transition-all duration-300 ${
            selectedCategory === category.id
              ? 'kozy-gradient text-white shadow-lg'
              : 'border-kozy-warm/30 text-kozy-warm hover:bg-kozy-warm/10 hover:border-kozy-warm'
          }`}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
