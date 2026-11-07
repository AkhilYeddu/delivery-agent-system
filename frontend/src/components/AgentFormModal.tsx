import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Bike, Check, AlertCircle } from 'lucide-react';
import { DeliveryAgent, AgentStatus, VehicleType, CreateAgentPayload } from '../types/agent';

interface AgentFormModalProps {
  isOpen: boolean;
  agentToEdit?: DeliveryAgent | null;
  onClose: () => void;
  onSubmit: (data: CreateAgentPayload) => Promise<void>;
}

const COMMON_SERVICE_AREAS = [
  'Downtown Core',
  'Harbor District',
  'Tech Corridor',
  'North Suburbs',
  'Metro West',
  'Uptown Arts',
  'Airport Zone',
];

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  isOpen,
  agentToEdit,
  onClose,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceArea, setServiceArea] = useState('Downtown Core');
  const [status, setStatus] = useState<AgentStatus>('active');
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [rating, setRating] = useState<number>(5.0);
  const [completedDeliveries, setCompletedDeliveries] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agentToEdit) {
      setFullName(agentToEdit.full_name);
      setPhone(agentToEdit.phone);
      setEmail(agentToEdit.email);
      setServiceArea(agentToEdit.service_area);
      setStatus(agentToEdit.status);
      setVehicleType(agentToEdit.vehicle_type);
      setRating(Number(agentToEdit.rating) || 5.0);
      setCompletedDeliveries(agentToEdit.completed_deliveries || 0);
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setServiceArea('Downtown Core');
      setStatus('active');
      setVehicleType('bike');
      setRating(5.0);
      setCompletedDeliveries(0);
    }
    setError(null);
  }, [agentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setError('Please provide a valid phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!serviceArea.trim()) {
      setError('Service area cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        service_area: serviceArea.trim(),
        status,
        vehicle_type: vehicleType,
        rating: Number(rating),
        completed_deliveries: Number(completedDeliveries),
      });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save delivery agent';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-cream-200 shadow-creamy-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-cream-200 bg-cream-50/60 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-cream-950 font-display">
              {agentToEdit ? 'Edit Delivery Agent' : 'Create New Delivery Agent'}
            </h2>
            <p className="text-xs text-cream-600 mt-0.5">
              {agentToEdit ? `Updating record for ${agentToEdit.id}` : 'Add a new agent to your dispatch fleet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cream-500 hover:text-cream-950 hover:bg-cream-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-cream-800 mb-1.5">
              Full Name <span className="text-caramel-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
              <input
                type="text"
                required
                placeholder="e.g. Elena Rostova"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="creamy-input w-full pl-10 text-sm"
              />
            </div>
          </div>

          {/* Contact (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cream-800 mb-1.5">
                Phone Number <span className="text-caramel-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
                <input
                  type="text"
                  required
                  placeholder="+1-555-0143"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="creamy-input w-full pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-800 mb-1.5">
                Email Address <span className="text-caramel-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
                <input
                  type="email"
                  required
                  placeholder="elena.r@dispatch.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="creamy-input w-full pl-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div>
            <label className="block text-xs font-semibold text-cream-800 mb-1.5">
              Service Area <span className="text-caramel-600">*</span>
            </label>
            <div className="relative mb-2">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
              <input
                type="text"
                required
                placeholder="Select below or type custom area"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="creamy-input w-full pl-10 text-sm"
              />
            </div>
            {/* Quick area suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SERVICE_AREAS.map((area) => (
                <button
                  type="button"
                  key={area}
                  onClick={() => setServiceArea(area)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    serviceArea === area
                      ? 'bg-caramel-100 border-caramel-300 text-caramel-900 font-medium'
                      : 'bg-cream-50 border-cream-200 text-cream-700 hover:bg-cream-100'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Status & Vehicle Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cream-800 mb-1.5">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AgentStatus)}
                className="creamy-input w-full text-sm font-medium"
              >
                <option value="active">Active (On Duty)</option>
                <option value="on_delivery">On Delivery</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-800 mb-1.5">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="creamy-input w-full text-sm font-medium"
              >
                <option value="bike">Bicycle</option>
                <option value="electric_bike">Electric Bike</option>
                <option value="scooter">Motor Scooter</option>
                <option value="car">Passenger Car</option>
                <option value="van">Delivery Van</option>
                <option value="walker">Walker</option>
              </select>
            </div>
          </div>

          {/* Rating and Deliveries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-cream-800 mb-1.5">
                Rating (1.0 - 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="creamy-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-800 mb-1.5">
                Completed Deliveries
              </label>
              <input
                type="number"
                min="0"
                value={completedDeliveries}
                onChange={(e) => setCompletedDeliveries(parseInt(e.target.value, 10) || 0)}
                className="creamy-input w-full text-sm"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="creamy-btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="creamy-btn-primary flex items-center gap-2 text-sm"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Saving...' : agentToEdit ? 'Save Changes' : 'Create Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

