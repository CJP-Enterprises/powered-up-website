export default function TopBar() {
  return (
    <div className="topbar">
      <div className="wrap topbar-inner">
        <div className="topbar-trust">
          <span className="topbar-badge">Licensed &amp; Insured · MA</span>
          <span className="dot">·</span>
          <span>Owner-Operated</span>
          <span className="dot">·</span>
          <span>Free Estimates</span>
        </div>
        <div>
          <a href="tel:+15086225919">(508) 622-5919</a>
          <span className="dot">·</span>
          <a href="sms:+15086225919">Text us</a>
          <span className="dot">·</span>
          <span>Mon–Sat · 7am–7pm</span>
        </div>
      </div>
    </div>
  );
}
