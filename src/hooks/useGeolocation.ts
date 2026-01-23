import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionDenied: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocalização não é suportada pelo seu navegador',
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionDenied: false,
        });
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Você negou o acesso à localização. Ative nas configurações do navegador para ver peladas próximas.';
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível no momento. Tente novamente.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo esgotado ao buscar localização. Tente novamente.';
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback(
    (lat: number, lon: number): number | null => {
      if (state.latitude === null || state.longitude === null) return null;

      const R = 6371; // Earth's radius in kilometers
      const dLat = ((lat - state.latitude) * Math.PI) / 180;
      const dLon = ((lon - state.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((state.latitude * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [state.latitude, state.longitude]
  );

  const formatDistance = useCallback((distance: number | null): string => {
    if (distance === null) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m de você`;
    }
    return `${distance.toFixed(1)}km de você`;
  }, []);

  return {
    ...state,
    requestLocation,
    calculateDistance,
    formatDistance,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}
