import { CalendarDays } from 'lucide-react';

const Topbar = () => (
  <nav className="topbar" aria-label="Головна навігація">
    <a className="brand" href="#top" aria-label="SportPlanner — на головну">
      <span className="brand-mark"><CalendarDays size={18} strokeWidth={2.5} /></span>
      <span>Sport<span>Planner</span></span>
    </a>
    <div className="nav-links">
      <a className="active" href="#planner">План</a>
      <a href="#tips">Поради</a>
      <button className="profile-button" aria-label="Відкрити профіль">А</button>
    </div>
  </nav>
);

export default Topbar;
