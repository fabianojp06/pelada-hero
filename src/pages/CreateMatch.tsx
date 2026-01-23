import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateMatch } from '@/hooks/useMatches';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, Calendar, Clock, DollarSign, Users, Lock, Globe, 
  Loader2, Navigation, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PLAYERS_PER_SIDE_OPTIONS = [
  { value: 5, label: '5 x 5 (Futsal)' },
  { value: 6, label: '6 x 6' },
  { value: 7, label: '7 x 7 (Society)' },
  { value: 8, label: '8 x 8' },
  { value: 11, label: '11 x 11 (Campo)' },
];

const CreateMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createMatch = useCreateMatch();
  const { latitude, longitude, loading: geoLoading, error: geoError, requestLocation, hasLocation, permissionDenied } = useGeolocation();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    address: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '20:00',
    price: '30',
    playersPerSide: 5,
    isPublic: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (useCurrentLocation && !hasLocation && !geoLoading) {
      requestLocation();
    }
  }, [useCurrentLocation, hasLocation, geoLoading, requestLocation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Local é obrigatório';
    }
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }
    if (!formData.time) {
      newErrors.time = 'Horário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Erro no formulário',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMatch.mutateAsync({
        title: formData.title,
        location: formData.location,
        address: formData.address || null,
        date: formData.date,
        time: formData.time,
        price: parseFloat(formData.price) || 0,
        max_players: formData.playersPerSide * 2,
        players_per_side: formData.playersPerSide,
        is_public: formData.isPublic,
        latitude: useCurrentLocation && hasLocation ? latitude : null,
        longitude: useCurrentLocation && hasLocation ? longitude : null,
      });

      toast({
        title: 'Pelada criada!',
        description: 'Sua pelada foi criada com sucesso.',
      });

      navigate('/my-matches');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar pelada',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Layout title="CRIAR PELADA">
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Nome da Pelada *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ex: Pelada de Quinta"
            className={`w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.title ? 'ring-2 ring-destructive' : ''
            }`}
          />
          {errors.title && (
            <p className="text-destructive text-sm">{errors.title}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Local *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Ex: Quadra do Clube"
            className={`w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.location ? 'ring-2 ring-destructive' : ''
            }`}
          />
          {errors.location && (
            <p className="text-destructive text-sm">{errors.location}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Endereço Completo
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Ex: Rua das Flores, 123"
            className="w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Use Current Location */}
        <div className="player-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              <span className="font-bold">Usar minha localização</span>
            </div>
            <button
              type="button"
              onClick={() => setUseCurrentLocation(!useCurrentLocation)}
              className={`w-12 h-6 rounded-full transition-colors ${
                useCurrentLocation ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  useCurrentLocation ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          {useCurrentLocation && (
            <div className="text-sm text-muted-foreground">
              {geoLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Obtendo localização...
                </div>
              )}
              {hasLocation && (
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4" />
                  Localização capturada! Jogadores próximos verão sua pelada primeiro.
                </div>
              )}
              {geoError && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {geoError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className={`w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.date ? 'ring-2 ring-destructive' : ''
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Horário *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className={`w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.time ? 'ring-2 ring-destructive' : ''
              }`}
            />
          </div>
        </div>

        {/* Players Per Side */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Jogadores na Linha *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PLAYERS_PER_SIDE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('playersPerSide', option.value)}
                className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                  formData.playersPerSide === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            Valor por Pessoa (R$)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0"
            min="0"
            step="5"
            className="w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Privacy Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Visibilidade
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('isPublic', true)}
              className={`player-card p-4 flex flex-col items-center gap-2 transition-all ${
                formData.isPublic ? 'border-primary bg-primary/10' : 'hover:border-muted-foreground/50'
              }`}
            >
              <Globe className={`w-8 h-8 ${formData.isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-bold">Pública</span>
              <span className="text-xs text-muted-foreground text-center">
                Qualquer pessoa pode solicitar participação
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('isPublic', false)}
              className={`player-card p-4 flex flex-col items-center gap-2 transition-all ${
                !formData.isPublic ? 'border-accent bg-accent/10' : 'hover:border-muted-foreground/50'
              }`}
            >
              <Lock className={`w-8 h-8 ${!formData.isPublic ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className="font-bold">Privada</span>
              <span className="text-xs text-muted-foreground text-center">
                Apenas convidados podem ver
              </span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createMatch.isPending}
          className="w-full btn-gold py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {createMatch.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Pelada'
          )}
        </button>
      </form>
    </Layout>
  );
};

export default CreateMatch;
