import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Bike, Check, AlertCircle } from 'lucide-react';

const COMMON_SERVICE_AREAS = [
  'Downtown Core',
  'Harbor District',
  'Tech Corridor',
  'North Suburbs',
  'Metro West',
  'Uptown Arts',
  'Airport Zone',
];

export const AgentFormModal = ({
  isOpen,
  agentToEdit,
  onClose,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceArea, setServiceArea] = useState('Downtown Core');
  const [status, setStatus] = useState('active');
  const [vehicleType, setVehicleType] = useState('bike');
  const [rating, setRating] = useState(5.0);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
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
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save delivery agent.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-cream-200 shadow-creamy-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-cream-200 bg-cream-50/60 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-cream-950">
              {agentToEdit ? 'Edit Delivery Agent' : 'Register New Agent'}
            </h3>
            <p className="text-xs text-cream-600 mt-0.5">
              {agentToEdit
                ? `Updating details for agent ${agentToEdit.id}`
                : 'Add a new courier to the fleet dispatch directory.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cream-500 hover:text-cream-950 hover:bg-cream-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-cream-800 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50/50 border border-cream-200 rounded-xl text-sm text-cream-900 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15"
              />
            </div>
          </div>

          {/* Phone & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cream-800 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-0199"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50/50 border border-cream-200 rounded-xl text-sm text-cream-900 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-800 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan.m@swiftcargo.io"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50/50 border border-cream-200 rounded-xl text-sm text-cream-900 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15"
                />
              </div>
            </div>
          </div>

          {/* Service Area & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cream-800 uppercase tracking-wider mb-1.5">
                Service Area *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
                <input
                  type="text"
                  required
                  list="service-areas"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Downtown Core"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50/50 border border-cream-200 rounded-xl text-sm text-cream-900 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15"
                />
                <datalist id="service-areas">
                  {COMMON_SERVICE_AREAS.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-800 uppercase tracking-wider mb-1.5">
                Duty Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-cream-50/50 border border-cream-200 rounded-xl text-sm text-cream-900 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15"
              >
                <option value="active">Active (Available)</option>
                <option value="on_delivery">On Delivery (En route)</option>
                <option value="inactive">Inactive (Off-shift)</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Vehicle Type & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cream-800 uppercase tracking-wider mb-1.5">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full py-2.5 px-3 bg-cream-50/50 border border-cream-200 rounded-xl text-sm text-cream-900 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15 capitalize"
              >
                <option value="bike">Bicycle</option>
                <option value="electric_bike">Electric Bike</option>
                <option value="scooter">Motor Scooter</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="walker">Walker (On Foot)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-800 uppercase tracking-wider mb-1.5">
                Initial Rating (1-5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full py-2.5 px-3 bg-cream-50/50 border border-cream-200 rounded-xl text-sm text-cream-900 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-800 uppercase tracking-wider mb-1.5">
                Completed Trips
              </label>
              <input
                type="number"
                min="0"
                value={completedDeliveries}
                onChange={(e) => setCompletedDeliveries(parseInt(e.target.value, 10) || 0)}
                className="w-full py-2.5 px-3 bg-cream-50/50 border border-cream-200 rounded-xl text-sm text-cream-900 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="creamy-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="creamy-btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving Agent...' : agentToEdit ? 'Save Changes' : 'Create Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
