import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  Bell,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-500',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              changeType === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {changeType === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    pendingTickets: 0,
    notificationsSent: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    transactionsToday: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Cargar estadisticas de usuarios
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, last_sign_in')
        .order('created_at', { ascending: false });

      if (!usersError && users) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const newToday = users.filter(u => new Date(u.created_at) >= today).length;
        const newWeek = users.filter(u => new Date(u.created_at) >= weekAgo).length;

        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          newUsersToday: newToday,
          newUsersWeek: newWeek
        }));

        setRecentUsers(users.slice(0, 5));
      }

      // Cargar estadisticas de transacciones
      const { count: transCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      if (transCount !== null) {
        setStats(prev => ({
          ...prev,
          totalTransactions: transCount
        }));
      }

      // Cargar tickets pendientes
      const { data: tickets, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ticketsError && tickets) {
        const pending = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
        setStats(prev => ({
          ...prev,
          pendingTickets: pending
        }));
        setRecentTickets(tickets.slice(0, 5));
      }

      // Cargar notificaciones enviadas
      const { count: notifCount } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true });

      if (notifCount !== null) {
        setStats(prev => ({
          ...prev,
          notificationsSent: notifCount
        }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-yellow-500/20 text-yellow-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/20 text-green-400',
      closed: 'bg-slate-500/20 text-slate-400'
    };
    const labels = {
      open: 'Abierto',
      in_progress: 'En Proceso',
      resolved: 'Resuelto',
      closed: 'Cerrado'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.open}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-slate-400 mt-1">Bienvenido al panel de administracion de Financia Suite</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={Users}
          change={`+${stats.newUsersWeek} esta semana`}
          changeType="up"
          color="indigo"
        />
        <StatCard
          title="Total Transacciones"
          value={stats.totalTransactions.toLocaleString()}
          icon={CreditCard}
          color="green"
        />
        <StatCard
          title="Tickets Pendientes"
          value={stats.pendingTickets}
          icon={Ticket}
          color={stats.pendingTickets > 5 ? 'red' : 'yellow'}
        />
        <StatCard
          title="Notificaciones Enviadas"
          value={stats.notificationsSent}
          icon={Bell}
          color="blue"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Usuarios Recientes</h2>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-700">
            {recentUsers.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No hay usuarios registrados aun
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-indigo-400 font-medium">
                      {(user.full_name || user.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user.full_name || 'Sin nombre'}
                    </p>
                    <p className="text-slate-400 text-sm truncate">{user.email}</p>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Tickets Recientes</h2>
            <Ticket className="w-5 h-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-700">
            {recentTickets.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No hay tickets aun
              </div>
            ) : (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{ticket.subject}</p>
                      <p className="text-slate-400 text-sm truncate mt-1">{ticket.description}</p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>{ticket.user_email}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Acciones Rapidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/notifications"
            className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Bell className="w-5 h-5 text-indigo-400" />
            <span className="text-white">Enviar Notificacion</span>
          </a>
          <a
            href="/admin/tickets"
            className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Ticket className="w-5 h-5 text-yellow-400" />
            <span className="text-white">Ver Tickets ({stats.pendingTickets})</span>
          </a>
          <a
            href="/admin/users"
            className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-white">Gestionar Usuarios</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
