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

function FilterSection({ title, children }) {
  return (
    <section className="border-t border-sky-100 pt-5 first:border-t-0 first:pt-0">
      <p className="mb-3 text-sm font-extrabold text-slate-950">{title}</p>
      {children}
    </section>
  );
}

function FilterSidebar({ filters, onFieldChange, onToggleRoomType, onToggleAmenity, onReset }) {
  return (
    <aside className="surface-card max-h-[calc(100vh-112px)] overflow-auto p-5 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-brand-700">Bộ lọc</p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950">Tiêu chí tìm kiếm</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Bộ lọc cố định bên trái, chỉ giữ các tiêu chí cần thiết để danh sách dễ đọc.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-bold text-brand-700 transition hover:bg-sky-50"
        >
          Xóa
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <FilterSection title="Ngân sách mỗi đêm">
          <div className="grid grid-cols-2 gap-3">
            <label className="field-shell px-3 py-3">
              <span className="mb-1 block text-xs font-bold text-slate-500">Từ</span>
              <input
                type="number"
                min="0"
                step="50000"
                value={filters.minPrice}
                onChange={(event) => onFieldChange('minPrice', event.target.value)}
                placeholder="0"
                className="w-full border-none bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="field-shell px-3 py-3">
              <span className="mb-1 block text-xs font-bold text-slate-500">Đến</span>
              <input
                type="number"
                min="0"
                step="50000"
                value={filters.maxPrice}
                onChange={(event) => onFieldChange('maxPrice', event.target.value)}
                placeholder="2000000"
                className="w-full border-none bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </FilterSection>

        <FilterSection title="Sức chứa">
          <label className="field-shell px-3 py-3">
            <span className="mb-1 block text-xs font-bold text-slate-500">Số khách</span>
            <input
              type="number"
              min="1"
              max="12"
              value={filters.guests}
              onChange={(event) => onFieldChange('guests', event.target.value)}
              className="w-full border-none bg-transparent text-sm font-bold text-slate-950 outline-none"
            />
          </label>
        </FilterSection>

        <FilterSection title="Loại chỗ ở">
          <select
            value={filters.roomTypes[0] || ''}
            onChange={(event) => {
              const current = filters.roomTypes[0];
              if (current) onToggleRoomType(current);
              if (event.target.value) onToggleRoomType(event.target.value);
            }}
            className="field-shell w-full px-3 py-3 text-sm font-bold text-slate-950 outline-none"
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
            className="field-shell w-full px-3 py-3 text-sm font-bold text-slate-950 outline-none"
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
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-sky-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500"
                >
                  <span>{amenity.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleAmenity(amenity.value)}
                    className="h-4 w-4 accent-[#1d4ed8]"
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
                className="flex cursor-pointer items-center justify-between rounded-lg border border-sky-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500"
              >
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={filters[field]}
                  onChange={(event) => onFieldChange(field, event.target.checked)}
                  className="h-4 w-4 accent-[#1d4ed8]"
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
