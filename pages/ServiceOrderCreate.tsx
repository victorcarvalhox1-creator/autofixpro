import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { OSStatus, ServiceOrder } from '../types';
import { estimateWorkload } from '../services/geminiService';
import { ArrowLeft, Save, Wand2, Loader2, User, Car, FileText, Calendar } from 'lucide-react';

const ServiceOrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const { addOrder } = useAppContext();
  const [isEstimating, setIsEstimating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientInsurer: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: '',
    vehicleYear: new Date().getFullYear(),
    description: '',
    technicalResponsible: '',
    entryDate: new Date().toISOString().split('T')[0],
    deliveryForecast: '',
    servicesTotal: 0,
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAIEstimate = async () => {
    if (!formData.description || !formData.vehicleModel) {
      alert("Preencha o modelo do veículo e a descrição do dano para usar a IA.");
      return;
    }

    setIsEstimating(true);
    try {
      const estimation = await estimateWorkload(
        formData.description, 
        `${formData.vehicleBrand} ${formData.vehicleModel}`
      );

      if (estimation.estimatedDays) {
        const entryDate = new Date(formData.entryDate);
        const deliveryDate = new Date(entryDate);
        deliveryDate.setDate(deliveryDate.getDate() + estimation.estimatedDays);
        
        setFormData(prev => ({
          ...prev,
          deliveryForecast: deliveryDate.toISOString().split('T')[0],
          servicesTotal: estimation.estimatedLaborCost || prev.servicesTotal,
          notes: prev.notes ? `${prev.notes}\n\nIA: ${estimation.reasoning}` : `IA: ${estimation.reasoning}`
        }));
      }
    } catch (error) {
      console.error("Failed to estimate", error);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrder: ServiceOrder = {
      id: `OS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      entryDate: formData.entryDate,
      deliveryForecast: formData.deliveryForecast,
      client: {
        id: `C-${Date.now()}`,
        name: formData.clientName,
        phone: formData.clientPhone,
        email: formData.clientEmail,
        insurer: formData.clientInsurer
      },
      vehicle: {
        brand: formData.vehicleBrand,
        model: formData.vehicleModel,
        plate: formData.vehiclePlate.toUpperCase(),
        color: formData.vehicleColor,
        year: Number(formData.vehicleYear)
      },
      status: OSStatus.DESMONTAGEM,
      description: formData.description,
      technicalResponsible: formData.technicalResponsible || 'A Definir',
      parts: [],
      laborAllocations: [], // Inicializa lista vazia de alocação
      servicesTotal: Number(formData.servicesTotal),
      partsTotal: 0,
      finalPrice: Number(formData.servicesTotal), // Will update when parts are added
      notes: formData.notes ? [formData.notes] : []
    };

    addOrder(newOrder);
    navigate('/orders');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nova Ordem de Serviço</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Client Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Dados do Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input required type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input required type="text" name="clientPhone" value={formData.clientPhone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seguradora</label>
              <input type="text" name="clientInsurer" placeholder="Ex: Porto, Azul (Deixe em branco se particular)" value={formData.clientInsurer} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Car size={20} className="text-blue-600" />
            Dados do Veículo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
              <input required type="text" name="vehiclePlate" value={formData.vehiclePlate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input required type="text" name="vehicleBrand" value={formData.vehicleBrand} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <input required type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <input type="number" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Wand2 size={120} />
          </div>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Detalhes do Serviço
            </h2>
            <button 
                type="button"
                onClick={handleAIEstimate}
                disabled={isEstimating}
                className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg border border-purple-200 font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
                {isEstimating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                Estimar Prazo e Custo (IA)
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Dano / Serviços *</label>
              <textarea 
                required 
                rows={4} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Descreva detalhadamente o que precisa ser feito..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Calendar size={14}/> Data Entrada
                    </label>
                    <input type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previsão Entrega</label>
                    <input type="date" name="deliveryForecast" value={formData.deliveryForecast} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mão de Obra (R$)</label>
                    <input type="number" name="servicesTotal" value={formData.servicesTotal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
            </div>
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Responsável Técnico</label>
                     <input type="text" name="technicalResponsible" placeholder="Ex: João Silva" value={formData.technicalResponsible} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
            
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Observações Internas</label>
                 <textarea rows={2} name="notes" value={formData.notes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
             <button 
                type="button" 
                onClick={() => navigate('/orders')}
                className="px-6 py-3 rounded-lg text-gray-700 bg-white border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
            >
                Cancelar
             </button>
             <button 
                type="submit" 
                className="px-8 py-3 rounded-lg text-white bg-blue-600 font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
            >
                <Save size={20} />
                Salvar Ordem de Serviço
             </button>
        </div>

      </form>
    </div>
  );
};

export default ServiceOrderCreate;