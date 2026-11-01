import { GraduationCap } from 'lucide-react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <GraduationCap size={24} color="#E53E3E" />
          <span>UCC Campus Hub</span>
        </div>
        <p className="footer-tagline">Your Campus. Your People. Your Community.</p>
        <p className="footer-copyright">
          © {new Date().getFullYear()} UCC Campus Hub. Built for students, by students.
        </p>
      </div>
    </footer>
  );
}

export default Footer;