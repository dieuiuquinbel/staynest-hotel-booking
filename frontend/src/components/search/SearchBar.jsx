import { useState } from 'react';

const ROOM_TYPES = [
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'superior', label: 'Superior' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'suite', label: 'Suite' },
  { value: 'family', label: 'Gia đình' },
];

const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'air_conditioner', label: 'Điều hòa' },
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'pool', label: 'Hồ bơi' },
  { value: 'parking', label: 'Bãi đỗ xe' },
  { value: 'balcony', label: 'Ban công' },
];

const DEFAULT_FORM = {
  city: '',
  checkIn: '',
  checkOut: '',
  adults: '2',
  children: '0',
  rooms: '1',
  guests: '2',
  roomType: '',
  minPrice: '',
  maxPrice: '',
  minRating: '',
  amenities: [],
  breakfastIncluded: false,
  freeCancellation: false,
  availableOnly: true,
};

function toBoolean(value) {
  return value === true || value === 'true' || value === '1';
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeForm(values = {}) {
  const adults = values.adults || values.guests || DEFAULT_FORM.adults;
  const children = values.children || DEFAULT_FORM.children;
  const rooms = values.rooms || DEFAULT_FORM.rooms;

  return {
    ...DEFAULT_FORM,
    ...values,
    adults,
    children,
    rooms,
    guests: String(Number(adults || 0) + Number(children || 0) || Number(values.guests || 2)),
    amenities: toArray(values.amenities),
    breakfastIncluded: toBoolean(values.breakfastIncluded),
    freeCancellation: toBoolean(values.freeCancellation),
    availableOnly: values.availableOnly === undefined ? DEFAULT_FORM.availableOnly : toBoolean(values.availableOnly),
  };
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`booking-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function GuestStepper({ label, value, min = 0, onChange }) {
  const numberValue = Number(value || 0);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="grid grid-cols-[36px_42px_36px] overflow-hidden rounded-lg border border-slate-200 bg-white text-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, numberValue - 1))}
          className="min-h-9 text-lg font-bold text-brand-700 transition hover:bg-sky-50"
        >
          -
        </button>
        <span className="flex items-center justify-center text-sm font-bold text-slate-950">{numberValue}</span>
        <button
          type="button"
          onClick={() => onChange(numberValue + 1)}
          className="min-h-9 text-lg font-bold text-brand-700 transition hover:bg-sky-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SearchBar({ defaultValues, onSubmit, submitLabel = 'Tìm', compact = false, showAdvanced = false }) {
  const [form, setForm] = useState(() => normalizeForm(defaultValues));
  const [guestOpen, setGuestOpen] = useState(false);

  const setFormValue = (name, value) => {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'adults' || name === 'children') {
        next.guests = String(Number(next.adults || 0) + Number(next.children || 0));
      }
      return next;
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValue(name, value);
  };

  const handleToggle = (name) => {
    setForm((current) => ({ ...current, [name]: !current[name] }));
  };

  const handleAmenityToggle = (value) => {
    setForm((current) => {
      const exists = current.amenities.includes(value);
      return {
        ...current,
        amenities: exists ? current.amenities.filter((item) => item !== value) : [...current.amenities, value],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({
      ...form,
      guests: String(Number(form.adults || 0) + Number(form.children || 0)),
    });
  };

  const guestSummary = `${form.adults} người lớn · ${form.children} trẻ em · ${form.rooms} phòng`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`booking-search ${compact ? 'booking-search-compact' : ''}`}
    >
      <div className="grid gap-0 md:grid-cols-[1.25fr_1fr_1fr_1.2fr_auto]">
        <Field label="Bạn muốn đến đâu?">
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Hà Nội, Đà Nẵng, Phú Quốc..."
            className="booking-input"
          />
        </Field>

        <Field label="Nhận phòng">
          <input
            type="date"
            name="checkIn"
            value={form.checkIn}
            onChange={handleChange}
            className="booking-input"
          />
        </Field>

        <Field label="Trả phòng">
          <input
            type="date"
            name="checkOut"
            value={form.checkOut}
            onChange={handleChange}
            className="booking-input"
          />
        </Field>

        <div className="relative">
          <button
            type="button"
            onClick={() => setGuestOpen((current) => !current)}
            className="booking-field w-full text-left"
          >
            <span>Khách & phòng</span>
            <strong className="block truncate text-sm text-slate-950">{guestSummary}</strong>
          </button>

          {guestOpen ? (
            <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-full min-w-[300px] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/15">
              <div className="grid gap-4">
                <GuestStepper
                  label="Người lớn"
                  value={form.adults}
                  min={1}
                  onChange={(value) => setFormValue('adults', String(value))}
                />
                <GuestStepper
                  label="Trẻ em"
                  value={form.children}
                  onChange={(value) => setFormValue('children', String(value))}
                />
                <GuestStepper
                  label="Phòng"
                  value={form.rooms}
                  min={1}
                  onChange={(value) => setFormValue('rooms', String(value))}
                />
              </div>
              <button
                type="button"
                onClick={() => setGuestOpen(false)}
                className="mt-5 w-full rounded-lg border border-brand-600 px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-sky-50"
              >
                Xong
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="min-h-[70px] rounded-lg bg-brand-600 px-7 text-base font-extrabold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 md:rounded-l-none"
        >
          {submitLabel}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ['availableOnly', 'Còn phòng'],
          ['freeCancellation', 'Hủy miễn phí'],
          ['breakfastIncluded', 'Có bữa sáng'],
        ].map(([field, label]) => (
          <button
            key={field}
            type="button"
            onClick={() => handleToggle(field)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              form[field] ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showAdvanced ? (
        <div className="mt-4 grid gap-3 border-t border-sky-100 pt-4 md:grid-cols-4">
          <Field label="Loại chỗ ở">
            <select name="roomType" value={form.roomType} onChange={handleChange} className="booking-input">
              <option value="">Tất cả</option>
              {ROOM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Giá từ">
            <input
              type="number"
              min="0"
              step="50000"
              name="minPrice"
              value={form.minPrice}
              onChange={handleChange}
              placeholder="500000"
              className="booking-input"
            />
          </Field>
          <Field label="Giá đến">
            <input
              type="number"
              min="0"
              step="50000"
              name="maxPrice"
              value={form.maxPrice}
              onChange={handleChange}
              placeholder="2000000"
              className="booking-input"
            />
          </Field>
          <Field label="Điểm đánh giá">
            <select name="minRating" value={form.minRating} onChange={handleChange} className="booking-input">
              <option value="">Tất cả</option>
              <option value="9">Từ 9.0</option>
              <option value="8">Từ 8.0</option>
              <option value="7">Từ 7.0</option>
            </select>
          </Field>

          <div className="md:col-span-4">
            <p className="mb-2 text-xs font-bold text-slate-500">Tiện nghi</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => {
                const active = form.amenities.includes(amenity.value);
                return (
                  <button
                    key={amenity.value}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.value)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                      active
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-sky-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-700'
                    }`}
                  >
                    {amenity.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

export default SearchBar;
