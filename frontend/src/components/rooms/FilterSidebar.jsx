const ROOM_TYPES = [
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'superior', label: 'Superior' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'suite', label: 'Suite' },
  { value: 'family', label: 'Gia đình' },
];

const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi miễn phí' },
  { value: 'air_conditioner', label: 'Điều hòa' },
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'pool', label: 'Hồ bơi' },
  { value: 'parking', label: 'Bãi đỗ xe' },
  { value: 'balcony', label: 'Ban công' },
];

const BUDGET_PRESETS = [
  { label: 'Dưới 800k', min: '', max: '800000' },
  { label: '800k - 1.5tr', min: '800000', max: '1500000' },
  { label: '1.5tr - 2.5tr', min: '1500000', max: '2500000' },
  { label: 'Cao cấp', min: '2500000', max: '' },
];

function shortCurrency(value) {
  const number = Number(value || 0);
  if (!number) return '0 đ';
  if (number >= 1000000) return `${(number / 1000000).toFixed(number % 1000000 === 0 ? 0 : 1)}tr`;
  return `${Math.round(number / 1000)}k`;
}

function FilterSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <p className="mb-3 text-[13px] font-black uppercase tracking-wide text-slate-800">{title}</p>
      {children}
    </section>
  );
}

function FilterInput({ label, children }) {
  return (
    <label className="field-shell block min-h-[72px] px-3.5 py-3">
      <span className="block text-xs font-bold leading-4 text-slate-500">{label}</span>
      <div className="mt-2 flex min-h-7 items-center">{children}</div>
    </label>
  );
}

function FilterSidebar({ filters, onFieldChange, onBudgetChange, onToggleRoomType, onToggleAmenity, onReset }) {
  const budgetLabel =
    filters.minPrice || filters.maxPrice
      ? `${filters.minPrice ? shortCurrency(filters.minPrice) : '0 đ'} - ${
          filters.maxPrice ? shortCurrency(filters.maxPrice) : 'Không giới hạn'
        }`
      : 'Chọn khoảng giá phù hợp';

  return (
    <aside className="surface-card max-h-[calc(100vh-112px)] overflow-y-auto overflow-x-hidden p-5 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-brand-700">Bộ lọc</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Tiêu chí tìm kiếm</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Giữ các tiêu chí chính ở bên trái để danh sách phòng dễ đọc và không bị rối.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-[0px] font-bold text-brand-700 transition hover:bg-sky-50"
        >
          <span className="text-sm">Làm mới</span>
          Xóa
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <FilterSection title="Ngân sách mỗi đêm">
          <div className="mb-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Khoảng giá</p>
            <p className="mt-1 text-lg font-black text-slate-950">{budgetLabel}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Giá mỗi phòng/đêm, chưa gồm dịch vụ phát sinh nếu có.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FilterInput label="Từ">
              <input
                type="number"
                min="0"
                step="50000"
                value={filters.minPrice}
                onChange={(event) => onFieldChange('minPrice', event.target.value)}
                placeholder="0"
                className="w-full border-none bg-transparent text-sm font-black text-slate-950 outline-none placeholder:text-slate-400"
              />
            </FilterInput>
            <FilterInput label="Đến">
              <input
                type="number"
                min="0"
                step="50000"
                value={filters.maxPrice}
                onChange={(event) => onFieldChange('maxPrice', event.target.value)}
                placeholder="2000000"
                className="w-full border-none bg-transparent text-sm font-black text-slate-950 outline-none placeholder:text-slate-400"
              />
            </FilterInput>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {BUDGET_PRESETS.map((preset) => {
              const active = filters.minPrice === preset.min && filters.maxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onBudgetChange({ minPrice: preset.min, maxPrice: preset.max })}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-extrabold transition ${
                    active
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                      : 'border-sky-100 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Sức chứa">
          <FilterInput label="Số khách">
            <input
              type="number"
              min="1"
              max="12"
              value={filters.guests}
              onChange={(event) => onFieldChange('guests', event.target.value)}
              className="w-full border-none bg-transparent text-sm font-black text-slate-950 outline-none"
            />
          </FilterInput>
        </FilterSection>

        <FilterSection title="Loại chỗ ở">
          <select
            value={filters.roomTypes[0] || ''}
            onChange={(event) => {
              const current = filters.roomTypes[0];
              if (current) onToggleRoomType(current);
              if (event.target.value) onToggleRoomType(event.target.value);
            }}
            className="field-shell min-h-[54px] w-full px-3 py-3 text-sm font-black text-slate-950 outline-none"
          >
            <option value="">Tất cả loại chỗ ở</option>
            {ROOM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FilterSection>

        <FilterSection title="Điểm đánh giá">
          <select
            value={filters.minRating}
            onChange={(event) => onFieldChange('minRating', event.target.value)}
            className="field-shell min-h-[54px] w-full px-3 py-3 text-sm font-black text-slate-950 outline-none"
          >
            <option value="">Tất cả mức điểm</option>
            <option value="9">9.0+ xuất sắc</option>
            <option value="8">8.0+ rất tốt</option>
            <option value="7">7.0+ tốt</option>
          </select>
        </FilterSection>

        <FilterSection title="Tiện nghi">
          <div className="grid gap-2">
            {AMENITIES.map((amenity) => {
              const checked = filters.amenities.includes(amenity.value);
              return (
                <label
                  key={amenity.value}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500"
                >
                  <span className="min-w-0">{amenity.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleAmenity(amenity.value)}
                    className="h-4 w-4 shrink-0 accent-[#1d4ed8]"
                  />
                </label>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Chính sách">
          <div className="grid gap-2">
            {[
              ['availableOnly', 'Chỉ hiện chỗ còn phòng'],
              ['breakfastIncluded', 'Bao gồm bữa sáng'],
              ['freeCancellation', 'Hủy miễn phí'],
            ].map(([field, label]) => (
              <label
                key={field}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500"
              >
                <span className="min-w-0">{label}</span>
                <input
                  type="checkbox"
                  checked={filters[field]}
                  onChange={(event) => onFieldChange(field, event.target.checked)}
                  className="h-4 w-4 shrink-0 accent-[#1d4ed8]"
                />
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

export default FilterSidebar;
