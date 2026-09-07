export default function AdminRouteLoading() {
  return (
    <main className="admin-dashboard-page">
      <div
        className="route-loading"
        role="status"
        aria-live="polite"
      >
        <div className="route-loading-heading" />

        <div className="route-loading-subheading" />

        <div className="route-loading-grid">
          {Array.from(
            { length: 4 },
            (_, index) => (
              <div
                className="route-loading-card"
                key={index}
              />
            ),
          )}
        </div>

        <span className="sr-only">
          Memuat dashboard admin...
        </span>
      </div>
    </main>
  );
}