import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Send,
  Users,
  User,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Clock,
  Filter,
  Search,
  X
} from 'lucide-react';

const NotificationsManager = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info', // info, success, warning, error
    target: 'all', // all, specific
    targetUsers: [],
    priority: 'normal' // low, normal, high, urgent
  });

  const notificationTypes = [
    { value: 'info', label: 'Informacion', icon: Info, color: 'blue' },
    { value: 'success', label: 'Exito', icon: CheckCircle, color: 'green' },
    { value: 'warning', label: 'Advertencia', icon: AlertTriangle, color: 'yellow' },
    { value: 'error', label: 'Error/Urgente', icon: AlertCircle, color: 'red' },
  ];

  const priorities = [
    { value: 'low', label: 'Baja' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar notificaciones enviadas
      const { data: notifs, error: notifsError } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!notifsError && notifs) {
        setNotifications(notifs);
      }

      // Cargar usuarios para envio especifico
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (!usersError && usersData) {
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        target: formData.target,
        target_users: formData.target === 'specific' ? formData.targetUsers : null,
        sent_by: user.id,
        sent_by_email: user.email,
        created_at: new Date().toISOString()
      };

      // Guardar notificacion en admin_notifications
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;

      // Crear notificaciones para usuarios
      if (formData.target === 'all') {
        // Enviar a todos los usuarios
        const userNotifications = users.map(u => ({
          user_id: u.id,
          notification_id: data.id,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          read: false,
          created_at: new Date().toISOString()
        }));

        await supabase.from('user_notifications').insert(userNotifications);
      } else {
        // Enviar a usuarios especificos
        const userNotifications = formData.targetUsers.map(userId => ({
          user_id: userId,
          notification_id: data.id,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          read: false,
          created_at: new Date().toISOString()
        }));

        await supabase.from('user_notifications').insert(userNotifications);
      }

      // Actualizar lista
      setNotifications([data, ...notifications]);

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        targetUsers: [],
        priority: 'normal'
      });
      setShowForm(false);

      alert('Notificacion enviada exitosamente!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error al enviar notificacion: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!confirm('Estas seguro de eliminar esta notificacion?')) return;

    try {
      await supabase.from('admin_notifications').delete().eq('id', id);
      await supabase.from('user_notifications').delete().eq('notification_id', id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    if (!typeConfig) return <Info className="w-5 h-5" />;
    const Icon = typeConfig.icon;
    return <Icon className="w-5 h-5" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[type] || colors.info;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter !== 'all' && n.type !== filter) return false;
    if (searchTerm && !n.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="h-64 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Notificaciones</h1>
          <p className="text-slate-400 mt-1">Envia notificaciones a los usuarios de la app</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Send className="w-5 h-5" />
          Nueva Notificacion
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Enviar Notificacion</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="p-6 space-y-6">
              {/* Titulo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Titulo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Ej: Nueva funcionalidad disponible"
                  required
                />
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mensaje *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Escribe el mensaje de la notificacion..."
                  required
                />
              </div>

              {/* Tipo y Prioridad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    {priorities.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destinatarios */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enviar a
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      checked={formData.target === 'all'}
                      onChange={() => setFormData({ ...formData, target: 'all', targetUsers: [] })}
                      className="text-indigo-500"
                    />
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">Todos los usuarios</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      checked={formData.target === 'specific'}
                      onChange={() => setFormData({ ...formData, target: 'specific' })}
                      className="text-indigo-500"
                    />
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">Usuarios especificos</span>
                  </label>
                </div>
              </div>

              {/* Seleccion de usuarios */}
              {formData.target === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Seleccionar usuarios
                  </label>
                  <div className="max-h-40 overflow-y-auto bg-slate-700 rounded-lg p-2 space-y-1">
                    {users.map(u => (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 p-2 hover:bg-slate-600 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetUsers.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                targetUsers: [...formData.targetUsers, u.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targetUsers: formData.targetUsers.filter(id => id !== u.id)
                              });
                            }
                          }}
                          className="text-indigo-500"
                        />
                        <span className="text-slate-300">{u.full_name || u.email}</span>
                        <span className="text-slate-500 text-sm">({u.email})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vista previa
                </label>
                <div className={`p-4 rounded-lg border ${getTypeColor(formData.type)}`}>
                  <div className="flex items-start gap-3">
                    {getTypeIcon(formData.type)}
                    <div>
                      <p className="font-medium">{formData.title || 'Titulo de la notificacion'}</p>
                      <p className="text-sm opacity-80 mt-1">{formData.message || 'Mensaje de la notificacion...'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Notificacion
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar notificaciones..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Todos los tipos</option>
          {notificationTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            Historial de Notificaciones ({filteredNotifications.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-700">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones enviadas</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(notif.type)}`}>
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-white font-medium">{notif.title}</p>
                        <p className="text-slate-400 text-sm mt-1">{notif.message}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.created_at).toLocaleString('es-ES')}
                      </span>
                      <span className="flex items-center gap-1">
                        {notif.target === 'all' ? (
                          <>
                            <Users className="w-3 h-3" />
                            Todos los usuarios
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            {notif.target_users?.length || 0} usuarios
                          </>
                        )}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        notif.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        notif.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        notif.priority === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {notif.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsManager;
