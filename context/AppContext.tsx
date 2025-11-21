
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceOrder, OSStatus, Part, DashboardStats, LaborAllocation, Collaborator } from '../types';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  user: string | null;
  session: Session | null;
  login: (u: string, p: string) => Promise<{ error: any }>; // Changed signature
  logout: () => void;

  // Data
  orders: ServiceOrder[];
  collaborators: Collaborator[];
  isLoading: boolean;
  
  addOrder: (order: ServiceOrder) => void;
  updateOrderStatus: (id: string, status: OSStatus) => void;
  addPartToOrder: (orderId: string, part: Part) => void;
  updatePartStatus: (orderId: string, partId: string, status: any) => void;
  addLaborAllocation: (orderId: string, allocation: LaborAllocation) => void;
  removeLaborAllocation: (orderId: string, allocationId: string) => void;
  addCollaborator: (collaborator: Collaborator) => void;
  updateCollaborator: (collaborator: Collaborator) => void;
  getStats: () => DashboardStats;
  getOrderById: (id: string) => ServiceOrder | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- AUTH STATE ---
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAuthenticated = !!session;

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user?.email || null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user?.email || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });
    
    if (!error) {
        return { error: null };
    }
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setOrders([]);
    setCollaborators([]);
  };

  // --- DATA STATE ---
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // --- SUPABASE FETCHING ---
  const fetchData = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      // 1. Fetch Collaborators (JSONB storage)
      const { data: collabsData, error: collabsError } = await supabase
        .from('collaborators')
        .select('*');
      
      if (collabsError) throw collabsError;
      
      if (collabsData) {
        // Map the JSONB 'content' column back to the object
        setCollaborators(collabsData.map((row: any) => row.content as Collaborator));
      }

      // 2. Fetch Orders (JSONB storage)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;

      if (ordersData) {
        // Map the JSONB 'content' column back to the object
        const mappedOrders: ServiceOrder[] = ordersData.map((row: any) => {
             const orderContent = row.content as ServiceOrder;
             // Ensure ID matches just in case
             return { ...orderContent, id: row.id };
        });
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do Supabase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, session]);


  // --- HELPER PARA ATUALIZAR JSONB ---
  // Como estamos usando JSONB, precisamos salvar o objeto inteiro novamente
  const saveOrderToSupabase = async (order: ServiceOrder) => {
      if (!session?.user) return;
      try {
          const { error } = await supabase
            .from('orders')
            .update({ content: order })
            .eq('id', order.id)
            .eq('user_id', session.user.id);
          
          if (error) throw error;
      } catch (err) {
          console.error("Erro ao atualizar OS no Supabase:", err);
      }
  }

  // --- ACTIONS ---

  const addOrder = async (order: ServiceOrder) => {
    setOrders(prev => [...prev, order]);

    if (!session?.user) return;

    try {
      const { error } = await supabase.from('orders').insert({
        id: order.id,
        user_id: session.user.id,
        content: order
      });
      
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao salvar OS:", err);
    }
  };

  const updateOrderStatus = async (id: string, status: OSStatus) => {
    let updatedOrder: ServiceOrder | null = null;
    
    setOrders(prev => prev.map(o => {
        if (o.id === id) {
            updatedOrder = { ...o, status };
            return updatedOrder;
        }
        return o;
    }));

    if (updatedOrder) {
        await saveOrderToSupabase(updatedOrder);
    }
  };

  const addPartToOrder = async (orderId: string, part: Part) => {
    let updatedOrder: ServiceOrder | null = null;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newParts = [...o.parts, part];
        const partsTotal = newParts.reduce((acc, p) => acc + (p.priceUnit * p.quantity), 0);
        const finalPrice = o.servicesTotal + partsTotal;
        
        updatedOrder = { ...o, parts: newParts, partsTotal, finalPrice };
        return updatedOrder;
      }
      return o;
    }));

    if (updatedOrder) {
        await saveOrderToSupabase(updatedOrder);
    }
  };

  const updatePartStatus = async (orderId: string, partId: string, status: any) => {
     let updatedOrder: ServiceOrder | null = null;

     setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        updatedOrder = {
            ...o,
            parts: o.parts.map(p => p.id === partId ? { ...p, status } : p)
        };
        return updatedOrder;
      }
      return o;
    }));

    if (updatedOrder) {
        await saveOrderToSupabase(updatedOrder);
    }
  };

  const addLaborAllocation = async (orderId: string, allocation: LaborAllocation) => {
    let updatedOrder: ServiceOrder | null = null;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        updatedOrder = { ...o, laborAllocations: [...(o.laborAllocations || []), allocation] };
        return updatedOrder;
      }
      return o;
    }));

    if (updatedOrder) {
        await saveOrderToSupabase(updatedOrder);
    }
  };

  const removeLaborAllocation = async (orderId: string, allocationId: string) => {
    let updatedOrder: ServiceOrder | null = null;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        updatedOrder = { ...o, laborAllocations: (o.laborAllocations || []).filter(l => l.id !== allocationId) };
        return updatedOrder;
      }
      return o;
    }));

    if (updatedOrder) {
        await saveOrderToSupabase(updatedOrder);
    }
  };

  const addCollaborator = async (collaborator: Collaborator) => {
    setCollaborators(prev => [...prev, collaborator]);

    if (!session?.user) return;

    try {
      await supabase.from('collaborators').insert({
        id: collaborator.id,
        user_id: session.user.id,
        content: collaborator
      });
    } catch (err) {
      console.error("Erro ao criar colaborador:", err);
    }
  };

  const updateCollaborator = async (collaborator: Collaborator) => {
    setCollaborators(prev => prev.map(c => c.id === collaborator.id ? collaborator : c));

    if (!session?.user) return;

    try {
      await supabase.from('collaborators').update({
        content: collaborator
      }).eq('id', collaborator.id).eq('user_id', session.user.id);
    } catch (err) {
      console.error("Erro ao atualizar colaborador:", err);
    }
  };

  const getOrderById = (id: string) => orders.find(o => o.id === id);

  const getStats = (): DashboardStats => {
    return {
      totalActive: orders.filter(o => o.status !== OSStatus.FINALIZADO).length,
      totalFinishedMonth: orders.filter(o => o.status === OSStatus.FINALIZADO).length,
      partsPending: orders.reduce((acc, o) => acc + o.parts.filter(p => p.status === 'Solicitado').length, 0),
      revenueMonth: orders.reduce((acc, o) => acc + o.finalPrice, 0)
    };
  };

  return (
    <AppContext.Provider value={{ 
        isAuthenticated,
        user,
        session,
        login,
        logout,
        orders, 
        collaborators,
        isLoading,
        addOrder, 
        updateOrderStatus, 
        addPartToOrder, 
        updatePartStatus,
        addLaborAllocation,
        removeLaborAllocation,
        addCollaborator,
        updateCollaborator,
        getStats, 
        getOrderById 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
