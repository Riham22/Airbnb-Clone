// components/help-center/help-center.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  popular?: boolean;
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-center.html',
  styleUrls: ['./help-center.css']
})
export class HelpCenterComponent {
  public searchQuery = '';
  public selectedCategory: HelpCategory | null = null;
  public selectedArticle: HelpArticle | null = null;

  public categories: HelpCategory[] = [
    {
      id: 'booking',
      title: 'Booking & Reservations',
      description: 'Help with making and managing bookings',
      icon: '📅',
      articles: [
        {
          id: 'book-place',
          title: 'How to book a place',
          content: 'To book a place: 1. Search for destinations and dates 2. Filter by price, amenities, etc. 3. Click on a listing to view details 4. Click "Reserve" and follow the prompts 5. Wait for host confirmation',
          popular: true
        },
        {
          id: 'modify-booking',
          title: 'Modify or cancel a booking',
          content: 'You can modify or cancel bookings through your Trips page. Cancellation policies vary by host.'
        }
      ]
    },
    {
      id: 'hosting',
      title: 'Hosting Help',
      description: 'Resources for Airbnb hosts',
      icon: '🏠',
      articles: [
        {
          id: 'become-host',
          title: 'How to become a host',
          content: 'To become a host: 1. Click "Host" in the top navigation 2. Click "List your space" 3. Follow the step-by-step process 4. Set your availability and pricing',
          popular: true
        },
        {
          id: 'pricing-tips',
          title: 'Pricing your space',
          content: 'Consider location, amenities, seasonality, and similar listings in your area when setting prices.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Security',
      description: 'Manage your account and security settings',
      icon: '👤',
      articles: [
        {
          id: 'reset-password',
          title: 'Reset your password',
          content: 'Go to Login > Forgot password and enter your email to receive reset instructions.',
          popular: true
        },
        {
          id: 'two-factor',
          title: 'Two-factor authentication',
          content: 'Enable 2FA in Account Settings > Security for extra protection.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Pricing',
      description: 'Questions about payments and pricing',
      icon: '💳',
      articles: [
        {
          id: 'payment-methods',
          title: 'Accepted payment methods',
          content: 'We accept credit cards, debit cards, PayPal, Google Pay, and Apple Pay.',
          popular: true
        },
        {
          id: 'service-fee',
          title: 'Understanding service fees',
          content: 'Service fees help us operate the platform and provide 24/7 customer support.'
        }
      ]
    }
  ];

  public popularArticles = this.categories
    .flatMap(cat => cat.articles.filter(article => article.popular))
    .slice(0, 6);

  public get filteredCategories(): HelpCategory[] {
    if (!this.searchQuery) return this.categories;

    const query = this.searchQuery.toLowerCase();
    return this.categories.map(category => ({
      ...category,
      articles: category.articles.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      )
    })).filter(category => category.articles.length > 0);
  }

  public selectCategory(category: HelpCategory): void {
    this.selectedCategory = category;
    this.selectedArticle = null;
  }

  public selectArticle(article: HelpArticle): void {
    this.selectedArticle = article;
  }

  public backToCategories(): void {
    this.selectedCategory = null;
    this.selectedArticle = null;
  }

  public backToArticles(): void {
    this.selectedArticle = null;
  }

  public contactSupport(): void {
    // In real app, this would open a contact form or chat
    alert('Opening support contact options...');
  }
}
