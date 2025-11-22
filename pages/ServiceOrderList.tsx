import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';

const ServiceOrderList: React.FC = () => {
  const { orders } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredOrders = orders.filter(os => 
    os.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium w-full md:w-auto">
                <Filter size={18} />
                Filtros
            </button>
        </div>

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
                <th className="px-6 py-4 whitespace-nowrap"></th>
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
                        <Link to={`/orders/${os.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm md:opacity-0 group-hover:opacity-100 transition-opacity">
                            Detalhes
                        </Link>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {filteredOrders.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                    Nenhuma ordem de serviço encontrada.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderList;