
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Calendar, X, FilterX, Edit, Trash2, Eye } from 'lucide-react';

const ServiceOrderList: React.FC = () => {
  const { orders, removeOrder } = useAppContext();
  const navigate = useNavigate();
  
  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  // Lógica de Filtro
  const filteredOrders = orders.filter(os => {
    // 1. Filtro de Texto
    const matchesSearch = 
      os.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Filtro de Data (Periodo)
    if (startDate) {
      if (os.entryDate < startDate) return false;
    }
    if (endDate) {
      if (os.entryDate > endDate) return false;
    }

    return true;
  });

  // Atalho para selecionar o mês inteiro
  const handleMonthSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // Formato YYYY-MM
    setMonthFilter(val);

    if (val) {
      const [year, month] = val.split('-');
      // Primeiro dia do mês
      const firstDay = `${val}-01`;
      
      // Último dia do mês (truque do dia 0 do próximo mês)
      const lastDayDate = new Date(parseInt(year), parseInt(month), 0);
      const lastDay = lastDayDate.toISOString().split('T')[0];

      setStartDate(firstDay);
      setEndDate(lastDay);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setMonthFilter('');
    setSearchTerm('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.preventDefault(); // prevent navigation
      if(window.confirm("Tem certeza que deseja excluir esta Ordem de Serviço?")) {
          removeOrder(id);
      }
  }

  const handleEdit = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      navigate(`/orders/edit/${id}`);
  }

  const hasActiveFilters = startDate || endDate || monthFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h1>
            <p className="text-gray-500 text-sm md:text-base">Gerencie todas as entradas e saídas da oficina.</p>
        </div>
        <button 
            onClick={() => navigate('/orders/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all w-full sm:w-auto"
        >
            <Plus size={20} />
            Nova OS
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Barra de Busca e Botão de Filtro */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-gray-50">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por Cliente, Placa ou Nº OS..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium w-full md:w-auto transition-colors
                  ${showFilters || hasActiveFilters 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
                <Filter size={18} />
                Filtros
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
            </button>
        </div>

        {/* Painel de Filtros Avançados */}
        {showFilters && (
          <div className="p-4 bg-slate-50 border-b border-gray-200 animate-in slide-in-from-top-2 fade-in duration-200">
             <div className="flex flex-col md:flex-row items-end gap-4">
                
                {/* Atalho Mês */}
                <div className="w-full md:w-auto">
                   <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mês de Referência</label>
                   <input 
                      type="month" 
                      value={monthFilter}
                      onChange={handleMonthSelect}
                      className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                </div>

                <div className="hidden md:block h-8 w-px bg-gray-300 mx-2 self-center"></div>

                {/* Período Personalizado */}
                <div className="flex gap-4 w-full md:w-auto flex-1">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data Inicial</label>
                      <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => { setStartDate(e.target.value); setMonthFilter(''); }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data Final</label>
                      <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => { setEndDate(e.target.value); setMonthFilter(''); }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                </div>

                {/* Botão Limpar */}
                <button 
                  onClick={clearFilters}
                  className="w-full md:w-auto px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
                  title="Limpar todos os filtros"
                >
                   <FilterX size={16} />
                   <span className="md:hidden">Limpar Filtros</span>
                </button>

             </div>
             {hasActiveFilters && (
               <div className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
                  <Calendar size={12} />
                  Filtrando OS com entrada entre 
                  <span className="font-bold">{startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'}</span> e 
                  <span className="font-bold">{endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Fim'}</span>
               </div>
             )}
          </div>
        )}

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                <th className="px-6 py-4 whitespace-nowrap">Nº OS</th>
                <th className="px-6 py-4 whitespace-nowrap">Cliente</th>
                <th className="px-6 py-4 whitespace-nowrap">Veículo</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap hidden md:table-cell">Entrada</th>
                <th className="px-6 py-4 whitespace-nowrap hidden md:table-cell">Previsão</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Total</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(os => (
                <tr key={os.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-blue-600 font-medium whitespace-nowrap">
                        <Link to={`/orders/${os.id}`}>{os.id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{os.client.name}</div>
                        <div className="text-xs text-gray-500">{os.client.insurer || 'Particular'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{os.vehicle.model}</div>
                        <div className="text-xs text-gray-500 uppercase">{os.vehicle.plate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {os.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap hidden md:table-cell">{new Date(os.entryDate).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap hidden md:table-cell">{new Date(os.deliveryForecast).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900 whitespace-nowrap">
                        R$ {os.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                             <Link 
                                to={`/orders/${os.id}`} 
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver Detalhes"
                             >
                                <Eye size={18} />
                             </Link>
                             <button
                                onClick={(e) => handleEdit(e, os.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                             >
                                <Edit size={18} />
                             </button>
                             <button
                                onClick={(e) => handleDelete(e, os.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                             >
                                <Trash2 size={18} />
                             </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {filteredOrders.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                    <div className="flex justify-center mb-3">
                       <Filter size={48} className="text-gray-200" />
                    </div>
                    <p>Nenhuma ordem de serviço encontrada com os filtros atuais.</p>
                    {(hasActiveFilters || searchTerm) && (
                      <button onClick={clearFilters} className="text-blue-600 text-sm font-medium hover:underline mt-2">
                        Limpar Filtros
                      </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderList;
