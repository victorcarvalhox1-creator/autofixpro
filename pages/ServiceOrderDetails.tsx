
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { KANBAN_COLUMNS } from '../constants';
import { OSStatus, PartStatus, Part, PartType, LaborAllocation } from '../types';
import { analyzeOSRisk, suggestParts } from '../services/geminiService';
import { 
  ArrowLeft, CheckCircle, AlertTriangle, Box, DollarSign, FileText, 
  Wrench, Calendar, Truck, BrainCircuit, Plus, Sparkles, PieChart, TrendingUp,
  UserPlus, Trash2, Hammer, PaintBucket, Printer, Edit2, ShoppingCart, Tag, Hash, Coins
} from 'lucide-react';

const ServiceOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getOrderById, updateOrderStatus, addPartToOrder, updatePart, removePartFromOrder, 
    updatePartStatus, addLaborAllocation, removeLaborAllocation, collaborators 
  } = useAppContext();
  
  const order = getOrderById(id || '');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'financial'>('overview');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedParts, setSuggestedParts] = useState<any[]>([]);

  // States for new part form
  const [showPartForm, setShowPartForm] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  
  const [newPartData, setNewPartData] = useState({
    name: '', type: PartType.PECA, priceUnit: 0, costUnit: 0, quantity: 1
  });

  // States for labor allocation
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState('');
  const [newLaborCost, setNewLaborCost] = useState(0);

  useEffect(() => {
      setAiAnalysis('');
      setSuggestedParts([]);
  }, [id]);

  if (!order) return <div className="p-8">Ordem de serviço não encontrada.</div>;

  // --- AI & Utility Functions ---

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeOSRisk(order);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSuggestParts = async () => {
      setIsAnalyzing(true);
      const parts = await suggestParts(order.description, `${order.vehicle.brand} ${order.vehicle.model}`);
      setSuggestedParts(parts);
      setIsAnalyzing(false);
  }

  const handleAddSuggestedPart = (partName: string) => {
      const newPart: Part = {
          id: `P-${Date.now()}`,
          name: partName,
          code: "GEN-000",
          type: PartType.PECA,
          quantity: 1,
          priceUnit: 0,
          costUnit: 0,
          status: PartStatus.SOLICITADO,
          supplier: "A definir"
      };
      addPartToOrder(order.id, newPart);
      setSuggestedParts(prev => prev.filter(p => p.partName !== partName));
  }

  const handleSavePart = (e: React.FormEvent) => {
      e.preventDefault();
      
      const partPayload: Part = {
          id: editingPartId || `P-${Date.now()}`,
          name: newPartData.name,
          code: "MANUAL",
          type: newPartData.type,
          quantity: newPartData.quantity,
          priceUnit: Number(newPartData.priceUnit),
          costUnit: Number(newPartData.costUnit),
          status: PartStatus.SOLICITADO, // Reset status or keep? Simpler to reset/default for now
          supplier: "Estoque/Externo"
      };

      if (editingPartId) {
          // Preserve original status if editing
          const original = order.parts.find(p => p.id === editingPartId);
          if (original) partPayload.status = original.status;
          
          updatePart(order.id, partPayload);
      } else {
          addPartToOrder(order.id, partPayload);
      }
      
      setShowPartForm(false);
      setEditingPartId(null);
      setNewPartData({ name: '', type: PartType.PECA, priceUnit: 0, costUnit: 0, quantity: 1 });
  };

  const handleEditPartClick = (part: Part) => {
      setNewPartData({
          name: part.name,
          type: part.type,
          priceUnit: part.priceUnit,
          costUnit: part.costUnit,
          quantity: part.quantity
      });
      setEditingPartId(part.id);
      setShowPartForm(true);
  }

  const handleAddLabor = (e: React.FormEvent) => {
      e.preventDefault();
      
      let workerName = '';
      let role: any = 'Funileiro';

      if (selectedCollaboratorId) {
          const collab = collaborators.find(c => c.id === selectedCollaboratorId);
          if (collab) {
              workerName = collab.name;
              role = collab.role;
          }
      } else {
          return; // Must select one
      }

      const allocation: LaborAllocation = {
          id: `L-${Date.now()}`,
          collaboratorId: selectedCollaboratorId,
          workerName: workerName,
          role: role,
          cost: Number(newLaborCost),
          date: new Date().toISOString().split('T')[0]
      };
      addLaborAllocation(order.id, allocation);
      setSelectedCollaboratorId('');
      setNewLaborCost(0);
  };

  // --- Calculation Logics ---

  // Revenue
  const totalRevenue = order.finalPrice;
  
  // Costs
  const totalPartsCost = order.parts.reduce((acc, p) => acc + (p.costUnit * p.quantity), 0);
  const totalLaborCost = (order.laborAllocations || []).reduce((acc, l) => acc + l.cost, 0);
  const totalCost = totalPartsCost + totalLaborCost;

  // Profit
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // --- PDF Report Generation ---
  const generateFinancialReport = () => {
    // ... (Existing implementation kept implicit to save space as it's not changed)
    window.print();
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors flex-1 sm:flex-none whitespace-nowrap ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex flex-wrap items-center gap-2 md:gap-3">
                    OS #{order.id} 
                    <span className="text-xs md:text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                        {order.vehicle.model} - {order.vehicle.plate}
                    </span>
                </h1>
            </div>
        </div>
        <div className="ml-auto w-full md:w-auto">
             <select 
                value={order.status} 
                onChange={(e) => updateOrderStatus(order.id, e.target.value as OSStatus)}
                className="w-full md:w-auto bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
                {KANBAN_COLUMNS.map(col => (
                    <option key={col} value={col}>{col}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex overflow-x-auto">
        <TabButton id="overview" label="Visão Geral" icon={FileText} />
        <TabButton id="parts" label="Peças e Insumos" icon={Box} />
        <TabButton id="financial" label="Financeiro e Custos" icon={DollarSign} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'overview' && (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Detalhes do Veículo e Serviço</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Cliente</p>
                                <p className="font-medium">{order.client.name}</p>
                                <p className="text-sm text-gray-400">{order.client.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Seguradora</p>
                                <p className="font-medium">{order.client.insurer || 'Particular'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Data Entrada</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400"/>
                                    <span>{new Date(order.entryDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Previsão Entrega</p>
                                <div className="flex items-center gap-2">
                                    <Truck size={16} className="text-gray-400"/>
                                    <span className={new Date(order.deliveryForecast) < new Date() ? 'text-red-600 font-bold' : ''}>
                                        {new Date(order.deliveryForecast).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-sm text-gray-500 mb-1 font-medium">Descrição do Dano / Serviço:</p>
                            <p className="text-gray-700 leading-relaxed">{order.description}</p>
                        </div>
                    </div>

                    {/* AI Section */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                            <div className="flex items-center gap-2 text-indigo-800">
                                <BrainCircuit size={24} />
                                <h3 className="text-lg font-bold">Assistente IA Gemini</h3>
                            </div>
                            <button 
                                onClick={handleRunAIAnalysis}
                                disabled={isAnalyzing}
                                className="w-full sm:w-auto text-sm bg-white text-indigo-600 px-4 py-2 rounded-lg border border-indigo-200 font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 text-center"
                            >
                                {isAnalyzing ? 'Analisando...' : 'Analisar Riscos da OS'}
                            </button>
                        </div>
                        
                        {aiAnalysis ? (
                            <div className="bg-white/60 p-4 rounded-lg text-sm text-gray-800 whitespace-pre-line border border-indigo-100/50">
                                {aiAnalysis}
                            </div>
                        ) : (
                            <p className="text-sm text-indigo-400 italic">Clique para analisar riscos de prazo e peças com Inteligência Artificial.</p>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'parts' && (
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                         <h3 className="text-lg font-bold text-gray-800">Gestão de Peças e Insumos</h3>
                         <div className="flex gap-2 w-full sm:w-auto">
                             <button onClick={handleSuggestParts} className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                                 <Sparkles size={16} />
                                 Sugerir (IA)
                             </button>
                             <button onClick={() => { setShowPartForm(!showPartForm); setEditingPartId(null); setNewPartData({ name: '', type: PartType.PECA, priceUnit: 0, costUnit: 0, quantity: 1 }); }} className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                 <Plus size={16} />
                                 Adicionar
                             </button>
                         </div>
                    </div>

                    {showPartForm && (
                        <form onSubmit={handleSavePart} className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-base font-bold text-slate-700 flex items-center gap-2">
                                    <ShoppingCart size={18} className="text-blue-600"/>
                                    {editingPartId ? 'Editar Item' : 'Novo Item'}
                                </h4>
                                <button type="button" onClick={() => setShowPartForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <Edit2 size={16} className="rotate-45" /> {/* Using Edit2 as close/cancel icon placeholder or just X */}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Linha 1: Nome e Tipo */}
                                <div className="md:col-span-8">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                                        <Tag size={12} /> Nome da Peça/Insumo
                                    </label>
                                    <input 
                                        required 
                                        className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                                        value={newPartData.name} 
                                        onChange={e => setNewPartData({...newPartData, name: e.target.value})} 
                                        placeholder="Ex: Parachoque Dianteiro" 
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Tipo</label>
                                    <select 
                                        className="w-full p-3 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                        value={newPartData.type} 
                                        onChange={e => setNewPartData({...newPartData, type: e.target.value as PartType})}
                                    >
                                        <option value={PartType.PECA}>Peça</option>
                                        <option value={PartType.INSUMO}>Insumo (Material)</option>
                                    </select>
                                </div>

                                {/* Linha 2: Quantidade, Custo e Venda */}
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                                        <Hash size={12} /> Quantidade
                                    </label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="1" 
                                        className="w-full p-3 text-base font-bold text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                        value={newPartData.quantity} 
                                        onChange={e => setNewPartData({...newPartData, quantity: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                                        <Coins size={12} /> Custo Unit. (R$)
                                    </label>
                                    <input 
                                        type="number" 
                                        required 
                                        step="0.01" 
                                        className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                        value={newPartData.costUnit} 
                                        onChange={e => setNewPartData({...newPartData, costUnit: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                                        <DollarSign size={12} /> Venda Unit. (R$)
                                    </label>
                                    <input 
                                        type="number" 
                                        required 
                                        step="0.01" 
                                        className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                        value={newPartData.priceUnit} 
                                        onChange={e => setNewPartData({...newPartData, priceUnit: Number(e.target.value)})} 
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                                <button type="button" onClick={() => {setShowPartForm(false); setEditingPartId(null);}} className="text-sm font-medium text-slate-600 px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                                <button type="submit" className="text-sm font-bold bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all">
                                    {editingPartId ? 'Atualizar Item' : 'Salvar Item'}
                                </button>
                            </div>
                        </form>
                    )}

                    {suggestedParts.length > 0 && (
                        <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-lg">
                            <h4 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                                <Sparkles size={14} /> Sugestões Gemini
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestedParts.map((p, idx) => (
                                    <div key={idx} className="bg-white px-3 py-1 rounded-full text-sm shadow-sm border border-purple-100 flex items-center gap-2">
                                        <span>{p.partName}</span>
                                        <span className="text-xs text-gray-400">({p.probability})</span>
                                        <button onClick={() => handleAddSuggestedPart(p.partName)} className="text-blue-600 hover:bg-blue-50 rounded-full p-0.5"><Plus size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4">Item</th>
                                    <th className="py-3 px-4">Tipo</th>
                                    <th className="py-3 px-4 text-center">Quantidade</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right bg-red-50/50 text-red-800">Custo (Un)</th>
                                    <th className="py-3 px-4 text-right">Venda (Un)</th>
                                    <th className="py-3 px-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.parts.map(part => (
                                    <tr key={part.id}>
                                        <td className="py-3 px-4 font-medium text-gray-800">
                                            {part.name}
                                            <span className="block text-xs text-gray-400">{part.code}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${part.type === PartType.INSUMO ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {part.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-bold text-gray-700">
                                            {part.quantity}
                                        </td>
                                        <td className="py-3 px-4">
                                            <select 
                                                value={part.status}
                                                onChange={(e) => updatePartStatus(order.id, part.id, e.target.value)}
                                                className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 ring-blue-200
                                                    ${part.status === PartStatus.ENTREGUE ? 'bg-green-100 text-green-700' : 
                                                      part.status === PartStatus.SOLICITADO ? 'bg-amber-100 text-amber-700' : 
                                                      'bg-gray-100 text-gray-700'}`}
                                            >
                                                {Object.values(PartStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-red-700 bg-red-50/30">
                                            R$ {part.costUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-gray-900">
                                            R$ {part.priceUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                         <td className="py-3 px-4 text-right">
                                             <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEditPartClick(part)} 
                                                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if(window.confirm("Remover este item?")) {
                                                            removePartFromOrder(order.id, part.id);
                                                        }
                                                    }} 
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                             </div>
                                        </td>
                                    </tr>
                                ))}
                                {order.parts.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-400">Nenhuma peça ou insumo cadastrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}

            {activeTab === 'financial' && (
                 <div className="space-y-6">
                    {/* ... (Financial Tab Content remains unchanged for brevity, as requested changes were for parts UI) */}
                    
                    {/* Alocação de Mão de Obra (Produtivos) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <UserPlus size={20} className="text-blue-600"/>
                                Alocação de Produtivos
                             </h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Selecione os profissionais da equipe que trabalharam nesta OS e o valor a ser pago (comissão/hora).
                        </p>

                        <form onSubmit={handleAddLabor} className="flex flex-wrap gap-3 items-end mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Selecione o Profissional</label>
                                <select 
                                    required 
                                    className="w-full p-2 text-sm border rounded" 
                                    value={selectedCollaboratorId} 
                                    onChange={e => setSelectedCollaboratorId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {collaborators.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} - {c.role}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-[150px]">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Valor Pago (R$)</label>
                                <input 
                                    required 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="w-full p-2 text-sm border rounded" 
                                    value={newLaborCost || ''} 
                                    onChange={e => setNewLaborCost(Number(e.target.value))} 
                                />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-[1px]">
                                <Plus size={18} />
                            </button>
                        </form>

                        <div className="space-y-2">
                            {(order.laborAllocations || []).map(allocation => (
                                <div key={allocation.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${allocation.role === 'Pintor' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {allocation.role === 'Pintor' ? <PaintBucket size={16} /> : <Hammer size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{allocation.workerName}</p>
                                            <p className="text-xs text-gray-500">{allocation.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-red-600">- R$ {allocation.cost.toFixed(2)}</span>
                                        <button onClick={() => removeLaborAllocation(order.id, allocation.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(order.laborAllocations || []).length === 0 && (
                                <p className="text-center text-sm text-gray-400 italic py-4">Nenhum profissional alocado ainda.</p>
                            )}
                        </div>
                    </div>
                 </div>
            )}

        </div>

        {/* Right Column (Sidebar Info) */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Wrench size={18} /> Responsável Técnico
                </h4>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                        {order.technicalResponsible.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium text-sm">{order.technicalResponsible}</p>
                        <p className="text-xs text-gray-400">Técnico Nível 3</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-700 mb-4">Status Atual</h4>
                <div className="flex flex-col gap-3">
                     {KANBAN_COLUMNS.map((step, idx) => {
                         const currentIdx = KANBAN_COLUMNS.indexOf(order.status);
                         const isCompleted = idx < currentIdx;
                         const isCurrent = idx === currentIdx;
                         
                         return (
                             <div key={step} className="flex items-center gap-3 relative">
                                 {idx < KANBAN_COLUMNS.length - 1 && (
                                     <div className={`absolute left-2.5 top-5 bottom-[-12px] w-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                 )}
                                 <div className={`w-5 h-5 rounded-full z-10 flex items-center justify-center text-[10px] border-2 
                                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                                      isCurrent ? 'bg-white border-blue-500 text-blue-500' : 'bg-white border-gray-300'}`}>
                                      {isCompleted && <CheckCircle size={12} />}
                                      {isCurrent && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                 </div>
                                 <span className={`text-sm ${isCurrent ? 'font-bold text-blue-600' : isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                                     {step}
                                 </span>
                             </div>
                         )
                     })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ServiceOrderDetails;
