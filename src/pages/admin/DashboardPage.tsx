import { useEffect, useState } from 'react';
import { Package, FolderOpen, Users as UsersIcon, Mail, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    projects: 0,
    team: 0,
    inquiries: 0
  });

  useEffect(() => {
    if (!user) {
      window.location.href = '/admin/login';
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const [productsRes, projectsRes, teamRes, inquiriesRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('team_members').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new')
      ]);

      setStats({
        products: productsRes.count || 0,
        projects: projectsRes.count || 0,
        team: teamRes.count || 0,
        inquiries: inquiriesRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  if (!user) {
    return <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="text-white">Laden...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-bg border-b border-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ET</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Admin-Bereich</h1>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <a href="/" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Website ansehen
              </a>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-card-hover text-white rounded-lg hover:bg-dark-700 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Willkommen zurück!</h2>
          <p className="text-gray-400">Verwalten Sie hier Ihre Website-Inhalte</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card-bg border border-card rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Produkte</p>
            <p className="text-3xl font-bold text-white">{stats.products}</p>
          </div>

          <div className="bg-card-bg border border-card rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Projekte</p>
            <p className="text-3xl font-bold text-white">{stats.projects}</p>
          </div>

          <div className="bg-card-bg border border-card rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Team-Mitglieder</p>
            <p className="text-3xl font-bold text-white">{stats.team}</p>
          </div>

          <div className="bg-card-bg border border-card rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-orange-400" />
              </div>
              {stats.inquiries > 0 && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                  Neu
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-1">Neue Anfragen</p>
            <p className="text-3xl font-bold text-white">{stats.inquiries}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/admin/products"
            className="bg-card-bg border border-card rounded-xl p-6 sm:p-8 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Package className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Produkte verwalten
            </h3>
            <p className="text-gray-400 text-sm">
              Erstellen, bearbeiten und verwalten Sie Ihre Mietshop-Produkte
            </p>
          </a>

          <a
            href="/admin/projects"
            className="bg-card-bg border border-card rounded-xl p-6 sm:p-8 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <FolderOpen className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Projekte verwalten
            </h3>
            <p className="text-gray-400 text-sm">
              Verwalten Sie Ihre Referenzprojekte und fügen Sie neue hinzu
            </p>
          </a>

          <a
            href="/admin/team"
            className="bg-card-bg border border-card rounded-xl p-6 sm:p-8 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <UsersIcon className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Team verwalten
            </h3>
            <p className="text-gray-400 text-sm">
              Fügen Sie Team-Mitglieder hinzu oder bearbeiten Sie Profile
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
