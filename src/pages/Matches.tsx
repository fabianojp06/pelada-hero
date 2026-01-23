import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { MatchCard } from '@/components/MatchCard';
import { MatchCardSkeleton } from '@/components/MatchCardSkeleton';
import { LocationPermissionBanner } from '@/components/LocationPermissionBanner';
import { DistanceBadge } from '@/components/DistanceBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMatches } from '@/hooks/useMatches';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Plus, Globe, MapPin } from 'lucide-react';

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: matches, isLoading } = useMatches(true);
  const { 
    hasLocation, 
    loading: geoLoading, 
    error: geoError,
    permissionDenied,
    requestLocation, 
    calculateDistance, 
    formatDistance 
  } = useGeolocation();
  
  const [showLocationBanner, setShowLocationBanner] = useState(true);
  const [locationRequested, setLocationRequested] = useState(false);

  // Try to get location on mount if not already denied
  useEffect(() => {
    const hasAskedBefore = localStorage.getItem('location_asked');
    if (!hasAskedBefore && !hasLocation && !permissionDenied) {
      // Don't auto-request, show banner instead
    }
  }, [hasLocation, permissionDenied]);

  const handleRequestLocation = () => {
    setLocationRequested(true);
    localStorage.setItem('location_asked', 'true');
    requestLocation();
  };

  const handleDismissBanner = () => {
    setShowLocationBanner(false);
    localStorage.setItem('location_dismissed', 'true');
  };

  const transformMatch = (match: any) => {
    const distance = match.latitude && match.longitude 
      ? calculateDistance(match.latitude, match.longitude) 
      : null;

    return {
      id: match.id,
      title: match.title,
      location: match.location,
      address: match.address || '',
      date: new Date(match.date),
      time: match.time,
      price: Number(match.price),
      maxPlayers: match.max_players,
      confirmedPlayers: match.participants
        ?.filter((p: any) => p.status === 'confirmed')
        .map((p: any) => ({
          id: p.profiles?.id || p.user_id,
          name: p.profiles?.name || 'Jogador',
          nickname: p.profiles?.nickname || 'Jogador',
          position: p.profiles?.position || 'MEI',
          overall: p.profiles?.overall || 70,
          attributes: { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70 },
        })) || [],
      waitingList: [],
      organizerId: match.creator_id,
      distance,
      distanceFormatted: distance !== null ? formatDistance(distance) : null,
      latitude: match.latitude,
      longitude: match.longitude,
    };
  };

  // Sort matches by distance if location is available, otherwise by date
  const sortedMatches = useMemo(() => {
    if (!matches) return [];
    
    const upcomingMatches = matches.filter((m) => new Date(m.date) >= new Date());
    const transformed = upcomingMatches.map(transformMatch);
    
    if (hasLocation) {
      return transformed.sort((a, b) => {
        // Matches with location come first, sorted by distance
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        // Fall back to date sorting
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }
    
    return transformed;
  }, [matches, hasLocation, calculateDistance, formatDistance]);

  const shouldShowBanner = showLocationBanner && 
    !hasLocation && 
    !localStorage.getItem('location_dismissed') &&
    (locationRequested || !localStorage.getItem('location_asked'));

  return (
    <Layout title="PARTIDAS">
      <div className="p-4 space-y-6">
        {user && (
          <button
            onClick={() => navigate('/matches/new')}
            className="w-full btn-gold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Nova Pelada
          </button>
        )}

        {/* Location Permission Banner */}
        {shouldShowBanner && (
          <LocationPermissionBanner
            onRequestLocation={handleRequestLocation}
            onDismiss={handleDismissBanner}
            loading={geoLoading}
            error={locationRequested ? geoError : null}
            permissionDenied={permissionDenied}
          />
        )}

        {/* Location Status */}
        {hasLocation && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <MapPin className="w-4 h-4" />
            <span>Mostrando peladas mais próximas primeiro</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl tracking-wider">PELADAS PÚBLICAS</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <MatchCardSkeleton />
              <MatchCardSkeleton />
            </div>
          ) : sortedMatches.length > 0 ? (
            sortedMatches.map((match) => (
              <div key={match.id} className="relative">
                {match.distanceFormatted && (
                  <div className="absolute top-3 right-3 z-10">
                    <DistanceBadge distance={match.distanceFormatted} />
                  </div>
                )}
                <MatchCard
                  match={match}
                  onClick={() => navigate(`/matches/${match.id}`)}
                />
              </div>
            ))
          ) : (
            <div className="player-card p-6 text-center">
              <p className="text-muted-foreground">Nenhuma pelada pública agendada</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Matches;
