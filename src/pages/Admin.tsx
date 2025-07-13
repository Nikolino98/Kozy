
import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import CategoriesManager from '@/components/admin/CategoriesManager';
import ProductsManager from '@/components/admin/ProductsManager';

const Admin = () => {
  const { isAuthenticated, isLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories'>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-kozy-warm/30 border-t-kozy-warm rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => window.location.reload()} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <ProductsManager />;
      case 'categories':
        return <CategoriesManager />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
