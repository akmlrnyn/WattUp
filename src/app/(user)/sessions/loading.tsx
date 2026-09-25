export default function ChargingHistoryLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat riwayat charging" className="charging-history-page">
      <div className="ui-skeleton history-loading-heading" />
      <div className="ui-skeleton history-loading-filter" />
      <div className="ui-skeleton history-loading-table" />
    </div>
  );
}
