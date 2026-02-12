/**
 * Domain Models für CF Veranstaltungstechnik
 *
 * Zentrale Datenmodelle für die gesamte Anwendung.
 * Diese Modelle sind unabhängig von der Datenbankimplementierung.
 */

// ===========================
// Product Domain
// ===========================

export interface TechnicalSpec {
  label: string;
  value: string;
}

// ===========================
// Project Domain
// ===========================

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  location: string;
  eventSize: string;
  technicalHighlights: string;
  tags: string[];
  imageUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// Team Domain
// ===========================

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  displayOrder: number;
  createdAt: Date;
}

// ===========================
// Offer Request Domain
// ===========================

export type OfferRequestSource = 'rental' | 'service' | 'workshop' | 'contact';

export type OfferRequestStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface SelectedProduct {
  id: string;
  name: string;
  category: string;
}

export interface OfferRequest {
  id: string;
  source: OfferRequestSource;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  eventType?: string;
  eventDate?: Date;
  eventLocation?: string;
  selectedProducts?: SelectedProduct[];
  message: string;
  status: OfferRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateOfferRequestDTO {
  source: OfferRequestSource;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  eventType?: string;
  eventDate?: Date;
  eventLocation?: string;
  selectedProducts?: SelectedProduct[];
  message: string;
}

export interface UpdateOfferRequestDTO {
  status?: OfferRequestStatus;
  message?: string;
}
