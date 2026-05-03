import { useMemo, useState } from 'react';

const DESTINATIONS = [
  { value: 'Ha Noi', label: 'Hà Nội', subtitle: 'Khách sạn trung tâm, căn hộ dịch vụ' },
  { value: 'Da Nang', label: 'Đà Nẵng', subtitle: 'Resort biển, suite gia đình' },
  { value: 'Ho Chi Minh', label: 'TP. Hồ Chí Minh', subtitle: 'Khách sạn công tác, căn hộ trung tâm' },
  { value: 'Hoi An', label: 'Hội An', subtitle: 'Không gian nghỉ dưỡng gần phố cổ' },
  { value: 'Phu Quoc', label: 'Phú Quốc', subtitle: 'Resort đảo, villa gia đình và hồ bơi' },
  { value: 'Nha Trang', label: 'Nha Trang', subtitle: 'Khách sạn biển, phòng view đại dương' },
  { value: 'Da Lat', label: 'Đà Lạt', subtitle: 'Villa nghỉ dưỡng, homestay và phòng áp mái' },
  { value: 'Sa Pa', label: 'Sa Pa', subtitle: 'Lodge núi, phòng săn mây và kỳ nghỉ yên tĩnh' },
];

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

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_NAMES = [
  'tháng 1',
  'tháng 2',
  'tháng 3',
  'tháng 4',
  'tháng 5',
  'tháng 6',
  'tháng 7',
  'tháng 8',
  'tháng 9',
  'tháng 10',
  'tháng 11',
  'tháng 12',
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

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(value) {
  const date = parseDateValue(value);
  if (!date) return '';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function isSameDate(first, second) {
  return first && second && toDateValue(first) === toDateValue(second);
}

function getMonthCells(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const leadingBlankCount = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: leadingBlankCount }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
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
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState(() => normalizeForm(defaultValues).city || '');
  const [destinationTouched, setDestinationTouched] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [dateView, setDateView] = useState(() => startOfDay(new Date()));
  const [destinationError, setDestinationError] = useState('');

  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedDestination = DESTINATIONS.find((destination) => destination.value === form.city);
  const filteredDestinations = DESTINATIONS.filter((destination) => {
    const keyword = destinationTouched ? destinationQuery.trim().toLowerCase() : '';
    if (!keyword) return true;
    return `${destination.label} ${destination.value} ${destination.subtitle}`.toLowerCase().includes(keyword);
  });

  const checkInDate = parseDateValue(form.checkIn);
  const checkOutDate = parseDateValue(form.checkOut);

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

  const handleDestinationSelect = (destination) => {
    setDestinationQuery(destination.label);
    setDestinationTouched(false);
    setFormValue('city', destination.value);
    setDestinationError('');
    setDestinationOpen(false);
  };

  const handleDateSelect = (date) => {
    if (date < today) return;

    const value = toDateValue(date);
    if (!form.checkIn || form.checkOut || (checkInDate && date <= checkInDate)) {
      setForm((current) => ({ ...current, checkIn: value, checkOut: '' }));
      return;
    }

    setForm((current) => ({ ...current, checkOut: value }));
    setDateOpen(false);
  };

  const handleQuickNights = (nights) => {
    const start = checkInDate && checkInDate >= today ? checkInDate : today;
    setForm((current) => ({
      ...current,
      checkIn: toDateValue(start),
      checkOut: toDateValue(addDays(start, nights)),
    }));
    setDateOpen(false);
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

    if (destinationQuery.trim() && !selectedDestination) {
      setDestinationError('Vui lòng chọn một điểm đến trong danh sách.');
      setDestinationOpen(true);
      return;
    }

    onSubmit?.({
      ...form,
      guests: String(Number(form.adults || 0) + Number(form.children || 0)),
    });
  };

  const dateSummary =
    form.checkIn && form.checkOut
      ? `${formatDateLabel(form.checkIn)} - ${formatDateLabel(form.checkOut)}`
      : form.checkIn
        ? `${formatDateLabel(form.checkIn)} - Chọn ngày trả`
        : 'Nhận phòng - Trả phòng';
  const guestSummary = `${form.adults} người lớn · ${form.children} trẻ em · ${form.rooms} phòng`;

  return (
    <form onSubmit={handleSubmit} className={`booking-search ${compact ? 'booking-search-compact' : ''}`}>
      <div className="grid gap-0 md:grid-cols-[1.25fr_1.6fr_1.2fr_auto]">
        <div className="relative">
          <Field label="Bạn muốn đến đâu?">
            <input
              type="text"
              value={destinationQuery}
              onFocus={() => {
                setDestinationOpen(true);
                setDestinationTouched(false);
                setDateOpen(false);
                setGuestOpen(false);
              }}
              onChange={(event) => {
                setDestinationQuery(event.target.value);
                setDestinationTouched(true);
                setFormValue('city', '');
                setDestinationError('');
                setDestinationOpen(true);
              }}
              placeholder="Chọn điểm đến"
              className="booking-input"
              autoComplete="off"
            />
          </Field>

          {destinationOpen ? (
            <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-full min-w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-black text-slate-950">Các điểm đến đang có phòng</p>
                <p className="mt-1 text-xs text-slate-500">Chỉ chọn trong danh sách để tránh không có kết quả.</p>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {filteredDestinations.length ? (
                  filteredDestinations.map((destination) => (
                    <button
                      key={destination.value}
                      type="button"
                      onClick={() => handleDestinationSelect(destination)}
                      className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-sky-50"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-100 text-brand-700">
                        ⌖
                      </span>
                      <span>
                        <span className="block text-sm font-black text-slate-950">{destination.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{destination.subtitle}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-5 text-sm text-slate-500">Chưa có khách sạn tại điểm đến này.</div>
                )}
              </div>
            </div>
          ) : null}

          {destinationError ? <p className="mt-2 text-xs font-bold text-rose-600">{destinationError}</p> : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setDateOpen((current) => !current);
              setDestinationOpen(false);
              setGuestOpen(false);
            }}
            className="booking-field w-full text-left"
          >
            <span>Nhận phòng - Trả phòng</span>
            <strong className="block truncate text-sm text-slate-950">{dateSummary}</strong>
          </button>

          {dateOpen ? (
            <div className="absolute left-1/2 top-[calc(100%+10px)] z-40 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/15">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setDateView((current) => addMonths(current, -1))}
                  disabled={dateView <= new Date(today.getFullYear(), today.getMonth(), 1)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ←
                </button>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-950">Chọn ngày lưu trú</p>
                  <p className="mt-1 text-xs text-slate-500">Ngày trả phòng phải sau ngày nhận phòng.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDateView((current) => addMonths(current, 1))}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-sky-50"
                >
                  →
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {[dateView, addMonths(dateView, 1)].map((monthDate) => (
                  <div key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}>
                    <h3 className="mb-3 text-center text-sm font-black text-slate-950">
                      {MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}
                    </h3>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {WEEKDAYS.map((weekday) => (
                        <div key={weekday} className="py-1 text-xs font-bold text-slate-400">
                          {weekday}
                        </div>
                      ))}
                      {getMonthCells(monthDate).map((date, index) => {
                        if (!date) return <div key={`blank-${index}`} />;

                        const disabled = date < today;
                        const selectedStart = isSameDate(date, checkInDate);
                        const selectedEnd = isSameDate(date, checkOutDate);
                        const inRange = checkInDate && checkOutDate && date > checkInDate && date < checkOutDate;

                        return (
                          <button
                            key={toDateValue(date)}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleDateSelect(date)}
                            className={`min-h-9 rounded-lg text-sm font-bold transition ${
                              selectedStart || selectedEnd
                                ? 'bg-brand-600 text-white'
                                : inRange
                                  ? 'bg-sky-50 text-brand-700'
                                  : disabled
                                    ? 'cursor-not-allowed text-slate-300'
                                    : 'text-slate-700 hover:bg-sky-50 hover:text-brand-700'
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="text-xs font-bold text-slate-500">
                  {form.checkIn && form.checkOut
                    ? `${formatDateLabel(form.checkIn)} đến ${formatDateLabel(form.checkOut)}`
                    : 'Chọn ngày nhận phòng, sau đó chọn ngày trả phòng'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 7].map((nights) => (
                    <button
                      key={nights}
                      type="button"
                      onClick={() => handleQuickNights(nights)}
                      className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                    >
                      + {nights} đêm
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setGuestOpen((current) => !current);
              setDestinationOpen(false);
              setDateOpen(false);
            }}
            className="booking-field w-full text-left"
          >
            <span>Khách & phòng</span>
            <strong className="block truncate text-sm text-slate-950">{guestSummary}</strong>
          </button>

          {guestOpen ? (
            <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-full min-w-[300px] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/15">
              <div className="grid gap-4">
                <GuestStepper label="Người lớn" value={form.adults} min={1} onChange={(value) => setFormValue('adults', String(value))} />
                <GuestStepper label="Trẻ em" value={form.children} onChange={(value) => setFormValue('children', String(value))} />
                <GuestStepper label="Phòng" value={form.rooms} min={1} onChange={(value) => setFormValue('rooms', String(value))} />
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
