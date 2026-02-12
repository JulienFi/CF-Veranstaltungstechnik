import { Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '../config/company';

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-card">
      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img
                src="/images/logo-cf.png"
                alt="CF Veranstaltungstechnik Logo"
                className="h-10 sm:h-12 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Ihr professioneller Partner für Veranstaltungstechnik – von der Planung bis zur Durchführung.
            </p>
            <div className="space-y-2">
              <a href={COMPANY_INFO.contact.phoneLink} className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors text-sm">
                <Phone className="w-4 h-4" />
                <span>{COMPANY_INFO.contact.phone}</span>
              </a>
              <a href={COMPANY_INFO.contact.emailLink} className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>{COMPANY_INFO.contact.email}</span>
              </a>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{COMPANY_INFO.address.full}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Leistungen</h3>
            <ul className="space-y-2">
              <li><a href="/mietshop" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Mietshop</a></li>
              <li><a href="/dienstleistungen" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Dienstleistungen</a></li>
              <li><a href="/werkstatt" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Werkstatt-Services</a></li>
              <li><a href="/projekte" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Referenzen</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Unternehmen</h3>
            <ul className="space-y-2">
              <li><a href="/team" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Team</a></li>
              <li><a href="/kontakt" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Kontakt</a></li>
              <li><a href="/impressum" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Impressum</a></li>
              <li><a href="/datenschutz" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Datenschutz</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Erreichbarkeit</h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-400">
                <div className="text-white mb-1">{COMPANY_INFO.businessHours.weekdays}</div>
                <div className="text-white mb-3">{COMPANY_INFO.businessHours.weekend}</div>
              </div>
              <p className="text-gray-500 text-xs mt-4">
                {COMPANY_INFO.businessHours.note}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-card mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {COMPANY_INFO.legalName}. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
