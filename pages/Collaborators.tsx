import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Collaborator } from '../types';
import { Users, Plus, FileText, DollarSign, User } from 'lucide-react';

const Collaborators: React.FC = () => {
  const { collaborators, addCollaborator, updateCollaborator, orders } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Collaborator>>({
    role: 'Funileiro',
    status: 'Ativo'
  });

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

  const generateCommissionReport = (collaborator: Collaborator) => {
    // Filter allocations for this collaborator
    const allocations = orders.flatMap(order => 
      (order.laborAllocations || [])
        .filter(allocation => allocation.collaboratorId === collaborator.id)
        .map(allocation => ({
          ...allocation,
          orderId: order.id,
          car: `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plate})`,
          entryDate: order.entryDate
        }))
    );

    const totalCommission = allocations.reduce((acc, curr) => acc + curr.cost, 0);
    const currentDate = new Date().toLocaleDateString('pt-BR');

    const printContent = `
      <html>
        <head>
          <title>Relatório de Comissões - ${collaborator.name}</title>
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Produção e Comissões</h1>
            <div class="info">
              <strong>Colaborador:</strong> ${collaborator.name}<br/>
              <strong>Função:</strong> ${collaborator.role}<br/>
              <strong>Data de Emissão:</strong> ${currentDate}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data OS</th>
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
              `).join('') : '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum serviço registrado.</td></tr>'}
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
  };

  return (
    <div className="space-y-6">
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

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborators.map(colab => (
          <div key={colab.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
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
                onClick={() => generateCommissionReport(colab)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium"
               >
                 <FileText size={16} />
                 Relatório
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaborators;