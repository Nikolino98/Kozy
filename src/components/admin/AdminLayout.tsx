
import { ReactNode } from 'react';
import { LogOut, Package, Tag, BarChart3, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: 'dashboard' | 'products' | 'categories';
  onTabChange: (tab: 'dashboard' | 'products' | 'categories') => void;
}

const AdminLayout = ({ children, activeTab, onTabChange }: AdminLayoutProps) => {
  const { admin, logout } = useAdmin();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-kozy-warm" />
              <h1 className="text-xl font-bold text-foreground">
                Panel de Administración
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Bienvenido, <strong>{admin?.username}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeTab === tab.id 
                        ? 'kozy-gradient text-white' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => onTabChange(tab.id as any)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
