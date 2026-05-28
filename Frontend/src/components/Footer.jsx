import React from "react";

const Footer = () => {
  return (
   <footer
  className="text-light text-center py-3"
  style={{ backgroundColor: "#716b97" }}
>
  <p className="mb-1">© 2025 E-Commerce. All rights reserved.</p>

  {/* Contact Number */}
  <p className="mb-1">📞 Contact: +91 98765 43210</p>

  {/* Social Media Icons */}
  <div className="d-flex justify-content-center gap-3 mt-2">
    
    {/* Facebook */}
    <a href="#" className="text-light">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 6.84 7.9v-5.59H4.9V8h1.94V6.5c0-1.92 1.15-2.98 2.9-2.98.84 0 1.72.15 1.72.15v1.89h-.97c-.96 0-1.26.6-1.26 1.22V8h2.14l-.34 2.31H9.23v5.59A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    </a>

    {/* Instagram */}
    <a href="#" className="text-light">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0C5.8 0 5.5.01 4.7.05 3.9.09 3.3.24 2.8.45c-.5.21-.9.49-1.3.93-.44.4-.72.8-.93 1.3-.21.5-.36 1.1-.4 1.9C.01 5.5 0 5.8 0 8s.01 2.5.05 3.3c.04.8.19 1.4.4 1.9.21.5.49.9.93 1.3.4.44.8.72 1.3.93.5.21 1.1.36 1.9.4.8.04 1.1.05 3.3.05s2.5-.01 3.3-.05c.8-.04 1.4-.19 1.9-.4.5-.21.9-.49 1.3-.93.44-.4.72-.8.93-1.3.21-.5.36-1.1.4-1.9.04-.8.05-1.1.05-3.3s-.01-2.5-.05-3.3c-.04-.8-.19-1.4-.4-1.9a3.4 3.4 0 0 0-.93-1.3 3.4 3.4 0 0 0-1.3-.93c-.5-.21-1.1-.36-1.9-.4C10.5.01 10.2 0 8 0zm0 3.9A4.1 4.1 0 1 1 3.9 8 4.1 4.1 0 0 1 8 3.9zm0 6.8A2.7 2.7 0 1 0 5.3 8 2.7 2.7 0 0 0 8 10.7zm4.3-7.1a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
      </svg>
    </a>

  </div>
</footer>
  );
};

export default Footer;
