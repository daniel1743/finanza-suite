import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Ticket,
  Search,
  Filter,
  Clock,
  User,
  MessageSquare,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  Mail
} from 'lucide-react';

const TicketsManager = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const statusConfig = {
    open: { label: 'Abierto', color: 'yellow', icon: AlertCircle },
    in_progress: { label: 'En Proceso', color: 'blue', icon: Loader },
    resolved: { label: 'Resuelto', color: 'green', icon: CheckCircle },
    closed: { label: 'Cerrado', color: 'slate', icon: X }
  };

  const priorityConfig = {
    low: { label: 'Baja', color: 'slate' },
    normal: { label: 'Normal', color: 'blue' },
    high: { label: 'Alta', color: 'orange' },
    urgent: { label: 'Urgente', color: 'red' }
  };

  const categories = [
    { value: 'bug', label: 'Error/Bug' },
    { value: 'feature', label: 'Nueva Funcionalidad' },
    { value: 'account', label: 'Cuenta/Acceso' },
    { value: 'billing', label: 'Facturacion' },
    { value: 'other', label: 'Otro' }
  ];

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          ticket_messages (
            id,
            message,
            sender_type,
            sender_id,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ordenar mensajes de cada ticket
      const ticketsWithSortedMessages = data?.map(ticket => ({
        ...ticket,
        ticket_messages: ticket.ticket_messages?.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        ) || []
      })) || [];

      setTickets(ticketsWithSortedMessages);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'resolved' || newStatus === 'closed'
            ? { resolved_at: new Date().toISOString(), resolved_by: user.id }
            : {})
        })
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(tickets.map(t =>
        t.id === ticketId
          ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
          : t
      ));

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Error al actualizar el ticket');
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const messageData = {
        ticket_id: selectedTicket.id,
        message: replyText,
        sender_type: 'admin',
        sender_id: user.id,
        sender_email: user.email,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // Actualizar el estado del ticket a "en proceso" si estaba abierto
      if (selectedTicket.status === 'open') {
        await updateTicketStatus(selectedTicket.id, 'in_progress');
      }

      // Actualizar UI
      const updatedTicket = {
        ...selectedTicket,
        ticket_messages: [...(selectedTicket.ticket_messages || []), data],
        status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status
      };

      setSelectedTicket(updatedTicket);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error al enviar respuesta');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.open;
    const colors = {
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${colors[config.color]}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = priorityConfig[priority] || priorityConfig.normal;
    const colors = {
      slate: 'bg-slate-500/20 text-slate-400',
      blue: 'bg-blue-500/20 text-blue-400',
      orange: 'bg-orange-500/20 text-orange-400',
      red: 'bg-red-500/20 text-red-400'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[config.color]}`}>
        {config.label}
      </span>
    );
  };

  const filteredTickets = tickets.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        t.subject?.toLowerCase().includes(search) ||
        t.user_email?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length
  };

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
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Tickets de Soporte</h1>
        <p className="text-slate-400 mt-1">Gestiona las solicitudes de ayuda de los usuarios</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Abiertos</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.open}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">En Proceso</p>
          <p className="text-2xl font-bold text-blue-400">{stats.in_progress}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Resueltos</p>
          <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Tickets List */}
        <div className="w-1/2 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-700 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tickets..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {status === 'all' ? 'Todos' : statusConfig[status]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-700">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay tickets que mostrar</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-indigo-600/20 border-l-2 border-l-indigo-500'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{ticket.subject}</p>
                      <p className="text-slate-400 text-sm truncate mt-1">{ticket.description}</p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {ticket.user_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                    </span>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="w-1/2 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedTicket.subject}</h2>
                    <p className="text-slate-400 text-sm mt-1">{selectedTicket.user_email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="open">Abierto</option>
                    <option value="in_progress">En Proceso</option>
                    <option value="resolved">Resuelto</option>
                    <option value="closed">Cerrado</option>
                  </select>
                  {getPriorityBadge(selectedTicket.priority)}
                  <span className="text-slate-500 text-sm">
                    {categories.find(c => c.value === selectedTicket.category)?.label || selectedTicket.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 border-b border-slate-700 bg-slate-700/30">
                <p className="text-sm text-slate-400 mb-1">Descripcion del problema:</p>
                <p className="text-slate-200">{selectedTicket.description}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTicket.ticket_messages?.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No hay respuestas aun</p>
                  </div>
                ) : (
                  selectedTicket.ticket_messages?.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender_type === 'admin'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === 'admin' ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          {new Date(msg.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              {(selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved') && (
                <form onSubmit={sendReply} className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe una respuesta..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={sending || !replyText.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {sending ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Selecciona un ticket para ver los detalles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsManager;
