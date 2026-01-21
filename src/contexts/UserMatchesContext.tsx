import { createContext, useContext, useState, ReactNode } from 'react';
import { Match, PlayerPayment } from '@/types';

interface UserMatchesContextType {
  joinedMatchIds: string[];
  payments: Record<string, PlayerPayment[]>;
  joinMatch: (matchId: string) => void;
  leaveMatch: (matchId: string) => void;
  isMatchJoined: (matchId: string) => boolean;
  togglePayment: (matchId: string, playerId: string) => void;
  isPlayerPaid: (matchId: string, playerId: string) => boolean;
}

const UserMatchesContext = createContext<UserMatchesContextType | undefined>(undefined);

export function UserMatchesProvider({ children }: { children: ReactNode }) {
  // Pre-join the first match for demo purposes
  const [joinedMatchIds, setJoinedMatchIds] = useState<string[]>(['1']);
  const [payments, setPayments] = useState<Record<string, PlayerPayment[]>>({});

  const joinMatch = (matchId: string) => {
    setJoinedMatchIds((prev) => {
      if (prev.includes(matchId)) return prev;
      return [...prev, matchId];
    });
  };

  const leaveMatch = (matchId: string) => {
    setJoinedMatchIds((prev) => prev.filter((id) => id !== matchId));
  };

  const isMatchJoined = (matchId: string) => {
    return joinedMatchIds.includes(matchId);
  };

  const togglePayment = (matchId: string, playerId: string) => {
    setPayments((prev) => {
      const matchPayments = prev[matchId] || [];
      const existingPayment = matchPayments.find((p) => p.playerId === playerId);
      
      if (existingPayment) {
        return {
          ...prev,
          [matchId]: matchPayments.map((p) =>
            p.playerId === playerId ? { ...p, paid: !p.paid, paidAt: !p.paid ? new Date() : undefined } : p
          ),
        };
      } else {
        return {
          ...prev,
          [matchId]: [...matchPayments, { playerId, paid: true, paidAt: new Date() }],
        };
      }
    });
  };

  const isPlayerPaid = (matchId: string, playerId: string) => {
    const matchPayments = payments[matchId] || [];
    const payment = matchPayments.find((p) => p.playerId === playerId);
    return payment?.paid || false;
  };

  return (
    <UserMatchesContext.Provider
      value={{
        joinedMatchIds,
        payments,
        joinMatch,
        leaveMatch,
        isMatchJoined,
        togglePayment,
        isPlayerPaid,
      }}
    >
      {children}
    </UserMatchesContext.Provider>
  );
}

export function useUserMatches() {
  const context = useContext(UserMatchesContext);
  if (context === undefined) {
    throw new Error('useUserMatches must be used within a UserMatchesProvider');
  }
  return context;
}
