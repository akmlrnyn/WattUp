export default function VehicleDetailLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat detail kendaraan" className="vehicle-detail-page vehicle-detail-loading">
      <div className="ui-skeleton vehicle-loading-back" />
      <div className="ui-skeleton vehicle-loading-hero" />
      <div className="vehicle-detail-stats">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="ui-skeleton vehicle-loading-stat" key={index} />
        ))}
      </div>
      <div className="ui-skeleton vehicle-loading-history" />
    </div>
  );
}
