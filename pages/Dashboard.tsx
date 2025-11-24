
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ComposedChart, Line
} from 'recharts';
import { Car, AlertCircle, TrendingUp, DollarSign, Wallet, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, Calendar, FilterX } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { orders } = useAppContext();
  const [filterType, setFilterType] = useState<'all' | 'open' | 'finished'>('all');

  // --- Estados de Filtro de Data ---
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  // Atalho para selecionar o mês inteiro
  const handleMonthSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // Formato YYYY-MM
    setMonthFilter(val);

    if (val) {
      const [year, month] = val.split('-');
      // Primeiro dia do mês
      const firstDay = `${val}-01`;
      
      // Último dia do mês
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
  };

  const hasDateFilters = !!(startDate || endDate || monthFilter);

  // --- Lógica de Cálculo Financeiro ---
  const financialData = useMemo(() => {
    return orders.map(order => {
      // Receita Total (Venda)
      const revenue = order.finalPrice;

      // Custo Variável: Peças (Preço de Custo)
      const partsCost = order.parts.reduce((acc, p) => acc + (p.costUnit * p.quantity), 0);

      // Custo Variável: Mão de Obra (Valor pago aos colaboradores)
      const laborCost = (order.laborAllocations || []).reduce((acc, l) => acc + l.cost, 0);

      const totalCost = partsCost + laborCost;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        id: order.id,
        car: order.vehicle.model,
        plate: order.vehicle.plate,
        status: order.status,
        entryDate: order.entryDate, // Usado para filtro
        revenue,
        totalCost,
        partsCost,
        laborCost,
        profit,
        margin
      };
    });
  }, [orders]);

  // Filtra dados com base no status selecionado e DATA
  const filteredFinancials = useMemo(() => {
    let data = financialData;

    // 1. Filtro de Status
    data = data.filter(item => {
      if (filterType === 'all') return true;
      if (filterType === 'open') return item.status !== 'Finalizado';
      if (filterType === 'finished') return item.status === 'Finalizado';
      return true;
    });

    // 2. Filtro de Data
    if (startDate) {
        data = data.filter(item => item.entryDate >= startDate);
    }
    if (endDate) {
        data = data.filter(item => item.entryDate <= endDate);
    }

    // Filtra apenas OS que já têm algum valor financeiro movimentado para os gráficos
    return data.filter(o => o.revenue > 0 || o.totalCost > 0);
  }, [financialData, filterType, startDate, endDate]);

  // Estatísticas Globais
  const totalRevenue = filteredFinancials.reduce((acc, o) => acc + o.revenue, 0);
  const totalCost = filteredFinancials.reduce((acc, o) => acc + o.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Dados para o Gráfico (Últimas 10 OS filtradas)
  const chartData = [...filteredFinancials]
    .sort((a, b) => b.id.localeCompare(a.id)) // Ordenar
    .slice(0, 10)
    .reverse()
    .map(o => ({
        name: o.car.split(' ')[0] + ' ' + o.plate.slice(-3), // Nome curto para o gráfico
        Receita: o.revenue,
        Custos: o.totalCost,
        Lucro: o.profit
    }));

  const StatCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="flex items-start justify-between z-10 relative">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {subtext && <p className={`text-xs mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={14}/> : trend === 'down' ? <ArrowDownRight size={14}/> : null}
            {subtext}
          </p>}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Financeiro</h1>
            <p className="text-gray-500">Análise de lucratividade em tempo real por Ordem de Serviço.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Botão de Filtro de Data */}
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters || hasDateFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
                <Calendar size={18} />
                {hasDateFilters ? 'Período Ativo' : 'Período'}
            </button>

            {/* Filtro de Status */}
            <div className="w-full sm:w-auto flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 flex items-center gap-2 text-gray-500 border-r border-gray-100">
                    <Filter size={16} />
                    <span className="text-sm font-medium hidden sm:inline">Status:</span>
                </div>
                <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none py-2 px-2 pr-8 cursor-pointer hover:text-blue-600 w-full sm:w-auto"
                >
                    <option value="all">Todas as Ordens</option>
                    <option value="open">Em Aberto (Andamento)</option>
                    <option value="finished">Finalizadas (Entregues)</option>
                </select>
            </div>
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      {showFilters && (
        <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl animate-in slide-in-from-top-2">
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
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Início</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setMonthFilter(''); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Fim</label>
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
                    title="Limpar filtros de data"
                >
                    <FilterX size={16} />
                    <span className="md:hidden">Limpar Datas</span>
                </button>
            </div>
            
            {hasDateFilters && (
                <div className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
                    <Calendar size={12} />
                    Filtrando resultados de 
                    <span className="font-bold">{startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'}</span> até 
                    <span className="font-bold">{endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Fim'}</span>
                </div>
            )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento" 
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
          icon={DollarSign} 
          color="bg-blue-600" 
          subtext={`${filteredFinancials.length} ordens filtradas`}
          trend="neutral"
        />
        <StatCard 
          title="Custos Totais" 
          value={`R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
          icon={Wallet} 
          color="bg-red-500" 
          subtext={`${totalRevenue > 0 ? ((totalCost/totalRevenue)*100).toFixed(1) : 0}% da receita`}
          trend="down"
        />
        <StatCard 
          title="Lucro Líquido" 
          value={`R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
          icon={TrendingUp} 
          color="bg-green-500"
          subtext="Resultado Operacional"
          trend="up"
        />
        <StatCard 
          title="Margem Média" 
          value={`${avgMargin.toFixed(1)}%`} 
          icon={AlertCircle} 
          color="bg-purple-500" 
          subtext={avgMargin < 20 ? "Atenção: Margem Baixa" : "Margem Saudável"}
          trend={avgMargin > 30 ? "up" : "down"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
             <TrendingUp size={20} className="text-gray-400"/>
             Lucratividade por Veículo ({filterType === 'all' ? 'Recentes' : filterType === 'open' ? 'Em Aberto' : 'Finalizados'})
          </h3>
          <div className="flex-1 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `R$${value/1000}k`} />
                <RechartsTooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
                <Legend />
                <Bar dataKey="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Custos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="Lucro" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribuição de Custos</h3>
           <div className="flex-1 flex items-center justify-center">
               {/* Simple Breakdown Visualization */}
               <div className="w-full space-y-6">
                   <div>
                       <div className="flex justify-between text-sm mb-2">
                           <span className="text-gray-600">Peças e Insumos</span>
                           <span className="font-bold text-gray-800">
                               R$ {filteredFinancials.reduce((acc, o) => acc + o.partsCost, 0).toLocaleString('pt-BR')}
                           </span>
                       </div>
                       <div className="w-full bg-gray-100 rounded-full h-3">
                           <div 
                                className="bg-amber-500 h-3 rounded-full" 
                                style={{ width: `${(filteredFinancials.reduce((acc, o) => acc + o.partsCost, 0) / totalCost * 100) || 0}%` }}
                            ></div>
                       </div>
                   </div>

                   <div>
                       <div className="flex justify-between text-sm mb-2">
                           <span className="text-gray-600">Mão de Obra (Produtiva)</span>
                           <span className="font-bold text-gray-800">
                               R$ {filteredFinancials.reduce((acc, o) => acc + o.laborCost, 0).toLocaleString('pt-BR')}
                           </span>
                       </div>
                       <div className="w-full bg-gray-100 rounded-full h-3">
                           <div 
                                className="bg-indigo-500 h-3 rounded-full" 
                                style={{ width: `${(filteredFinancials.reduce((acc, o) => acc + o.laborCost, 0) / totalCost * 100) || 0}%` }}
                            ></div>
                       </div>
                   </div>

                   <div className="pt-6 border-t border-gray-100">
                       <div className="p-4 bg-gray-50 rounded-lg text-center">
                           <p className="text-xs text-gray-500 uppercase font-bold mb-1">Lucro Médio por Carro</p>
                           <p className="text-xl font-bold text-green-600">
                               R$ {(filteredFinancials.length > 0 ? totalProfit / filteredFinancials.length : 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                           </p>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      </div>

      {/* Detailed Profitability Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-800">Detalhamento por Ordem de Serviço</h3>
             <button className="text-sm text-blue-600 font-medium hover:underline">Exportar Relatório</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">OS / Veículo</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Entrada</th>
                        <th className="px-6 py-4 text-right">Receita</th>
                        <th className="px-6 py-4 text-right text-red-600 bg-red-50/30">Custo Peças</th>
                        <th className="px-6 py-4 text-right text-red-600 bg-red-50/30">Custo M.O.</th>
                        <th className="px-6 py-4 text-right text-green-700 bg-green-50/30">Lucro Líq.</th>
                        <th className="px-6 py-4 text-center">Margem %</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredFinancials.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Car size={16} />
                                    </div>
                                    <div>
                                        <Link to={`/orders/${item.id}`} className="font-bold text-gray-900 hover:text-blue-600">
                                            {item.car}
                                        </Link>
                                        <div className="text-xs text-gray-400">{item.id} • {item.plate}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {new Date(item.entryDate).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right text-red-500 font-mono bg-red-50/10">
                                {item.partsCost > 0 ? `- R$ ${item.partsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="px-6 py-4 text-right text-red-500 font-mono bg-red-50/10">
                                {item.laborCost > 0 ? `- R$ ${item.laborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-green-700 bg-green-50/10">
                                R$ {item.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-block px-2 py-1 rounded font-bold text-xs border ${
                                    item.margin < 20 ? 'bg-red-100 text-red-700 border-red-200' : 
                                    item.margin < 40 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                    'bg-green-100 text-green-700 border-green-200'
                                }`}>
                                    {item.margin.toFixed(1)}%
                                </span>
                            </td>
                        </tr>
                    ))}
                    {filteredFinancials.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-gray-400 italic">
                                Nenhuma Ordem de Serviço encontrada para o período selecionado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
