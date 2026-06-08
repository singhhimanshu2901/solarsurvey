import React, { useState } from 'react';
import { Sun, Mail, Phone, MapPin, ChevronUp } from 'lucide-react';

function Footer() {
  const [email, setEmail] = useState('');

  function handleSubscribe(e) {
    e.preventDefault();

    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }

    alert('Thank you for subscribing!');
    setEmail('');
  }

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  return (
    <footer className="footer">
      <div className="footerGlow"></div>

      <div className="footerContent">
        <div className="footerBrand">
          <div className="footerLogo">
            <Sun size={30} />
            <h2>AI Solar Survey</h2>
          </div>

          <p>
            Smart AI-powered solar feasibility, bill OCR, subsidy
            calculation, ROI analysis and qualified lead generation platform.
          </p>

          <button className="topBtn" onClick={scrollTop}>
            <ChevronUp size={18} />
            Back to top
          </button>
        </div>

        <div className="footerBox">
          <h3>Features</h3>
          <a>Bill OCR</a>
          <a>Roof Analysis</a>
          <a>Shadow Detection</a>
          <a>ROI Calculator</a>
          <a>Lead Scoring</a>
        </div>

        <div className="footerBox">
          <h3>Platform</h3>
          <a>Customer Portal</a>
          <a>Company Dashboard</a>
          <a>Survey Reports</a>
          <a>Subscription Plans</a>
          <a>Solar CRM</a>
        </div>

        <div className="footerBox">
          <h3>Contact</h3>

          <p className="footerContact">
            <Mail size={16} /> support@aisolar.com
          </p>

          <p className="footerContact">
            <Phone size={16} /> +91 9876543210
          </p>

          <p className="footerContact">
            <MapPin size={16} /> India
          </p>

          <form onSubmit={handleSubscribe} className="subscribeBox">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footerBottom">
        <p>© 2026 AI Solar Survey Platform. All rights reserved.</p>
        <p>Built with ☀️ React + Firebase</p>
      </div>
    </footer>
  );
}

export default Footer;