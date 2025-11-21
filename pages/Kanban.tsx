import React from 'react';
import { useAppContext } from '../context/AppContext';
import { KANBAN_COLUMNS } from '../constants';
import { ServiceOrder } from '../types';
import { Link } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';

const Kanban: React.FC = () => {
  const { orders } = useAppContext();

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const getPriorityColor = (date: string) => {
      const delivery = new Date(date);
      const now = new Date();
      const diffTime = delivery.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "border-l-4 border-red-500"; // Delayed
      if (diffDays <= 2) return "border-l-4 border-amber-500"; // Close
      return "border-l-4 border-blue-500"; // OK
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quadro de Produção</h1>
        <div className="text-sm text-gray-500 flex gap-4">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Atrasado</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded-full"></span> Próximo</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> No prazo</div>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {KANBAN_COLUMNS.map((column) => {
            const columnOrders = getOrdersByStatus(column);
            
            return (
              <div key={column} className="w-80 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{column}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">
                    {columnOrders.length}
                  </span>
                </div>
                
                <div className="flex-1 bg-slate-100 rounded-xl p-3 space-y-3 overflow-y-auto custom-scrollbar">
                  {columnOrders.map((os: ServiceOrder) => (
                    <Link key={os.id} to={`/orders/${os.id}`} className="block">
                        <div className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getPriorityColor(os.deliveryForecast)}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-slate-500 font-medium">{os.id}</span>
                                {os.parts.some(p => p.status === 'Solicitado') && (
                                    <AlertTriangle size={14} className="text-amber-500" title="Peças pendentes" />
                                )}
                            </div>
                            <h4 className="font-bold text-gray-800 text-sm mb-1">{os.vehicle.model}</h4>
                            <p className="text-xs text-gray-500 mb-3 truncate">{os.vehicle.plate}</p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center text-gray-400 gap-1">
                                    <Clock size={12} />
                                    <span className="text-xs">{new Date(os.deliveryForecast).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center text-gray-600 font-bold" title={os.technicalResponsible}>
                                    {os.technicalResponsible.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </Link>
                  ))}
                  {columnOrders.length === 0 && (
                      <div className="h-24 flex items-center justify-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-lg">
                          Vazio
                      </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Kanban;
