
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Collaborator } from '../types';
import { Users, Plus, FileText, User, X, Calendar, Printer } from 'lucide-react';

const Collaborators: React.FC = () => {
  const { collaborators, addCollaborator, updateCollaborator, orders } = useAppContext();
  
  // Form States
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Collaborator>>({
    role: 'Funileiro',
    status: 'Ativo'
  });

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (formData.id) {
      updateCollaborator(formData as Collaborator);
    } else {
      addCollaborator({
        ...formData,
        id: `C-${Date.now()}`,
      } as Collaborator);
    }
    setShowForm(false);
    setFormData({ role: 'Funileiro', status: 'Ativo' });
  };

  const openReportModal = (collab: Collaborator) => {
    setSelectedCollab(collab);
    
    // Set default dates (First and Last day of current month)
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    setReportStartDate(firstDay);
    setReportEndDate(lastDay);
    setShowReportModal(true);
  };

  const generateCommissionReport = () => {
    if (!selectedCollab) return;

    // Filter allocations for this collaborator within the date range
    const allocations = orders.flatMap(order => 
      (order.laborAllocations || [])
        .filter(allocation => {
            // Check ID
            if (allocation.collaboratorId !== selectedCollab.id) return false;

            // Check Date Range (allocation.date is YYYY-MM-DD)
            // Se a alocação não tiver data específica, usamos a data de entrada da OS como fallback
            const refDate = allocation.date || order.entryDate;
            
            if (reportStartDate && refDate < reportStartDate) return false;
            if (reportEndDate && refDate > reportEndDate) return false;

            return true;
        })
        .map(allocation => ({
          ...allocation,
          orderId: order.id,
          car: `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plate})`,
          entryDate: allocation.date || order.entryDate // Use allocation date if available for display
        }))
    );

    const totalCommission = allocations.reduce((acc, curr) => acc + curr.cost, 0);
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const startFmt = new Date(reportStartDate).toLocaleDateString('pt-BR');
    const endFmt = new Date(reportEndDate).toLocaleDateString('pt-BR');

    const printContent = `
      <html>
        <head>
          <title>Relatório de Comissões - ${selectedCollab.name}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; }
            h1 { color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .info { margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f3f4f6; text-align: left; padding: 10px; border-bottom: 2px solid #e5e7eb; font-size: 12px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
            .period-badge { background: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Produção e Comissões</h1>
            <div class="info">
              <strong>Colaborador:</strong> ${selectedCollab.name}<br/>
              <strong>Função:</strong> ${selectedCollab.role}<br/>
              <strong>Emissão:</strong> ${currentDate}<br/><br/>
              <span class="period-badge">Período: ${startFmt} até ${endFmt}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Nº OS</th>
                <th>Veículo</th>
                <th>Serviço/Função</th>
                <th style="text-align: right;">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              ${allocations.length > 0 ? allocations.map(item => `
                <tr>
                  <td>${new Date(item.entryDate).toLocaleDateString('pt-BR')}</td>
                  <td>${item.orderId}</td>
                  <td>${item.car}</td>
                  <td>${item.role}</td>
                  <td style="text-align: right;">R$ ${item.cost.toFixed(2)}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum serviço registrado neste período.</td></tr>'}
            </tbody>
          </table>

          <div class="total">
            Total a Pagar: R$ ${totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          <div class="footer">
            <p>__________________________________________</p>
            <p>Assinatura do Responsável</p>
            <br/>
            AutoFix Pro - Gestão Inteligente
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const win = window.open('', '', 'height=700,width=900');
    if (win) {
        win.document.write(printContent);
        win.document.close();
    }
    
    setShowReportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Equipe & Comissões</h1>
          <p className="text-gray-500">Gerencie colaboradores e gere relatórios de pagamento.</p>
        </div>
        <button 
          onClick={() => { setFormData({ role: 'Funileiro', status: 'Ativo' }); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Novo Colaborador
        </button>
      </div>

      {/* Form Modal/Section */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2">
          <h3 className="font-bold text-gray-800 mb-4">Cadastrar/Editar Colaborador</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Nome Completo</label>
              <input 
                required
                type="text" 
                className="w-full p-2 border rounded" 
                value={formData.name || ''} 
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Função</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="Funileiro">Funileiro</option>
                <option value="Pintor">Pintor</option>
                <option value="Preparador">Preparador</option>
                <option value="Montador">Montador</option>
                <option value="Polidor">Polidor</option>
                <option value="Geral">Geral</option>
              </select>
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Telefone</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded" 
                value={formData.phone || ''} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200">Cancelar</button>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* Collaborators List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborators.map(colab => (
          <div key={colab.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {colab.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{colab.name}</h3>
                  <p className="text-sm text-gray-500">{colab.role}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${colab.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {colab.status}
              </span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
               <div className="text-xs text-gray-400 flex items-center gap-1">
                 <User size={12} /> ID: {colab.id}
               </div>
               <button 
                onClick={() => openReportModal(colab)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium border border-transparent hover:border-blue-100"
               >
                 <FileText size={16} />
                 Relatório
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Date Filter Modal */}
      {showReportModal && selectedCollab && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2">
                       <Printer size={18} className="text-blue-600" />
                       Gerar Relatório de Comissões
                   </h3>
                   <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                       <X size={20} />
                   </button>
               </div>
               
               <div className="p-6 space-y-4">
                   <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold">
                           {selectedCollab.name.charAt(0)}
                       </div>
                       <div>
                           <p className="font-bold text-blue-900">{selectedCollab.name}</p>
                           <p className="text-xs text-blue-600">{selectedCollab.role}</p>
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Data Inicial</label>
                           <div className="relative">
                               <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                               <input 
                                   type="date" 
                                   className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   value={reportStartDate}
                                   onChange={(e) => setReportStartDate(e.target.value)}
                               />
                           </div>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Data Final</label>
                           <div className="relative">
                               <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                               <input 
                                   type="date" 
                                   className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   value={reportEndDate}
                                   onChange={(e) => setReportEndDate(e.target.value)}
                               />
                           </div>
                       </div>
                   </div>
               </div>

               <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                   <button 
                       onClick={() => setShowReportModal(false)}
                       className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                   >
                       Cancelar
                   </button>
                   <button 
                       onClick={generateCommissionReport}
                       className="px-4 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2"
                   >
                       <FileText size={16} />
                       Gerar PDF
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Collaborators;
