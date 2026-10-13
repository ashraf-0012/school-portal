import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCrestIcon } from '../icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: School Identity Placeholder */}
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
              <div className="school-crest" style={{ width: '36px', height: '36px' }}>
                <ShieldCrestIcon size={20} />
              </div>
              <span className="footer-title">Crestfield</span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-4)' }}>
              Committed to holistic academic development, moral discipline, and intellectual excellence
              across Junior and Senior secondary education.
            </p>
            <div className="footer-motto-tag">
              Motto: <em>Excellence, Integrity, Leadership</em>
            </div>
          </div>

          {/* Column 2: Academic Divisions */}
          <div>
            <h4 className="footer-heading">Academics</h4>
            <ul className="footer-links">
              <li>Junior Secondary School (JSS 1 – JSS 3)</li>
              <li>Senior Secondary Science Track</li>
              <li>Senior Secondary Arts & Humanities</li>
              <li>Senior Secondary Commercial Department</li>
              <li>Basic & Senior Certificate Examinations</li>
            </ul>
          </div>

          {/* Column 3: Portal & Navigation */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/login">Portal Login</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Placeholder */}
          <div>
            <h4 className="footer-heading">Campus Information</h4>
            <address className="footer-address" style={{ fontStyle: 'normal', fontSize: '0.875rem' }}>
              <p>Address: plot 175, Cadastral Zone E27, APO, Abuja 900110, Federal Capital Territory</p>
              <p>State: Abuja / APO, Nigeria</p>
              <p>Phone: 07066564484</p>
              <p>Email: crest@gmail.com</p>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex-between" style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8125rem', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <p>© {currentYear} Crestfield Academy. All rights reserved.</p>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Committed to Educational Standards and Excellence</p>
        </div>
      </div>
    </footer>
  );
}
