// help-center.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faRocket,
  faHome,
  faUserTie,
  faShieldAlt,
  faCreditCard,
  faWrench,
  faBook,
  faArrowRight,
  faArrowLeft,
  faQuestionCircle,
  faStar,
  faCheck,
  faTimes,
  faPhone,
  faComments,
  faExclamationTriangle,
  faLock,
  faUser,
  faCalendarCheck,
  faMoneyBillWave,
  faSync,
  faUserPlus,
  faEnvelope,
  faCog
} from '@fortawesome/free-solid-svg-icons';

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  popular?: boolean;
  icon: any;
}

interface Category {
  id: number;
  title: string;
  description: string;
  icon: any;
  articles: Article[];
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './help-center.html',
  styleUrls: ['./help-center.css']
})
export class HelpCenterComponent implements OnInit {
  // Font Awesome Icons
  faSearch = faSearch;
  faRocket = faRocket;
  faHome = faHome;
  faUserTie = faUserTie;
  faShieldAlt = faShieldAlt;
  faCreditCard = faCreditCard;
  faWrench = faWrench;
  faBook = faBook;
  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;
  faQuestionCircle = faQuestionCircle;
  faStar = faStar;
  faCheck = faCheck;
  faTimes = faTimes;
  faPhone = faPhone;
  faComments = faComments;
  faExclamationTriangle = faExclamationTriangle;
  faLock = faLock;
  faUser = faUser;
  faCalendarCheck = faCalendarCheck;
  faMoneyBillWave = faMoneyBillWave;
  faSync = faSync;
  faUserPlus = faUserPlus;
  faEnvelope = faEnvelope;
  faCog = faCog;

  searchQuery = '';
  selectedCategory: Category | null = null;
  selectedArticle: Article | null = null;
  isLoading = false;
  showSearchResults = false;

  categories: Category[] = [
    {
      id: 1,
      title: 'Getting Started',
      description: 'Learn how to use our platform and get started',
      icon: faRocket,
      articles: [
        {
          id: 1,
          title: 'How to create an account',
          content: `Creating an account on our platform is simple and takes just a few minutes:

1. Click the "Sign Up" button in the top right corner
2. Enter your email address and create a secure password
3. Verify your email address by clicking the link we send you
4. Complete your profile with your personal information

Once your account is created, you can start browsing properties, making bookings, and saving your favorite listings.`,
          category: 'Getting Started',
          popular: true,
          icon: faUserPlus
        },
        {
          id: 2,
          title: 'Verifying your email',
          content: 'Email verification is required to ensure account security and prevent spam. After signing up, check your inbox for a verification email. Click the link within 24 hours to activate your account.',
          category: 'Getting Started',
          icon: faEnvelope
        },
        {
          id: 3,
          title: 'Setting up your profile',
          content: 'A complete profile helps build trust with hosts and other users. Upload a profile photo, add a bio, and verify your phone number for better booking success rates.',
          category: 'Getting Started',
          icon: faUser
        }
      ]
    },
    {
      id: 2,
      title: 'Booking & Reservations',
      description: 'Everything about booking properties and managing reservations',
      icon: faHome,
      articles: [
        {
          id: 4,
          title: 'How to book a property',
          content: `Booking a property is easy with our platform:

1. Search for properties using filters like location, dates, and price
2. Click on a listing to view details and photos
3. Select your check-in and check-out dates
4. Enter the number of guests
5. Review the total price and house rules
6. Click "Book Now" and complete payment

You'll receive instant confirmation and can message the host directly through our platform.`,
          category: 'Booking & Reservations',
          popular: true,
          icon: faCalendarCheck
        },
        {
          id: 5,
          title: 'Cancellation policy',
          content: 'Our cancellation policies vary by property. Flexible: Full refund 24 hours before check-in. Moderate: Full refund 5 days before check-in. Strict: 50% refund up to 1 week before check-in. Always check the specific property\'s cancellation policy before booking.',
          category: 'Booking & Reservations',
          icon: faTimes
        },
        {
          id: 6,
          title: 'Payment methods',
          content: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers in some regions. All payments are processed securely through our encrypted payment gateway.',
          category: 'Booking & Reservations',
          icon: faCreditCard
        }
      ]
    },
    {
      id: 3,
      title: 'Hosting',
      description: 'Become a host and list your property on our platform',
      icon: faUserTie,
      articles: [
        {
          id: 7,
          title: 'How to become a host',
          content: `To become a host, follow these steps:

1. Click "Become a Host" from your profile menu
2. Create your listing with photos, description, and amenities
3. Set your availability calendar and pricing
4. Verify your identity and payment details
5. Review and publish your listing

Our team will review your listing within 24-48 hours. Once approved, your property will be visible to millions of travelers worldwide.`,
          category: 'Hosting',
          popular: true,
          icon: faUserTie
        },
        {
          id: 8,
          title: 'Setting up your listing',
          content: 'Create an attractive listing with high-quality photos, detailed descriptions, and accurate amenities. Set competitive pricing, establish house rules, and configure your calendar availability to maximize bookings.',
          category: 'Hosting',
          icon: faCog
        },
        {
          id: 9,
          title: 'Pricing your property',
          content: 'Price competitively by researching similar properties in your area. Consider factors like seasonality, local events, and amenities. Use our smart pricing tool to automatically adjust rates based on demand.',
          category: 'Hosting',
          icon: faMoneyBillWave
        }
      ]
    },
    {
      id: 4,
      title: 'Account & Security',
      description: 'Manage your account settings and security features',
      icon: faShieldAlt,
      articles: [
        {
          id: 10,
          title: 'Changing your password',
          content: 'To change your password: Go to Account Settings > Security > Change Password. Enter your current password, then your new password (must be at least 8 characters with letters and numbers). Click "Update Password".',
          category: 'Account & Security',
          icon: faLock
        },
        {
          id: 11,
          title: 'Two-factor authentication',
          content: `Enable 2FA for enhanced security:

1. Go to Account Settings > Security
2. Click "Enable Two-Factor Authentication"
3. Choose SMS or authenticator app
4. Follow the setup instructions
5. Save backup codes in a secure place

With 2FA enabled, you'll need both your password and a verification code to log in.`,
          category: 'Account & Security',
          popular: true,
          icon: faShieldAlt
        },
        {
          id: 12,
          title: 'Privacy settings',
          content: 'Control your privacy by managing what information is visible to others. You can hide your exact location, make your profile private, and choose what booking information is shared with hosts.',
          category: 'Account & Security',
          icon: faUser
        }
      ]
    },
    {
      id: 5,
      title: 'Payment & Billing',
      description: 'Payment issues, billing questions, and refund information',
      icon: faCreditCard,
      articles: [
        {
          id: 13,
          title: 'Understanding charges',
          content: 'Your total includes: Base price × nights, Cleaning fee (if applicable), Service fee (14-20% of subtotal), Occupancy taxes (if applicable). All fees are displayed before booking confirmation.',
          category: 'Payment & Billing',
          icon: faMoneyBillWave
        },
        {
          id: 14,
          title: 'Refund requests',
          content: 'To request a refund: Go to Trips > Select booking > Request Refund. Provide reason and supporting documents. Host has 24 hours to respond. If unresolved, contact our support team within 72 hours.',
          category: 'Payment & Billing',
          icon: faSync
        },
        {
          id: 15,
          title: 'Payment failures',
          content: `If payment fails:

1. Check card details and expiration date
2. Ensure sufficient funds/credit limit
3. Contact your bank for restrictions
4. Try a different payment method
5. Clear browser cache and cookies

If issues persist, contact our support team with error code and screenshots.`,
          category: 'Payment & Billing',
          popular: true,
          icon: faExclamationTriangle
        }
      ]
    },
    {
      id: 6,
      title: 'Troubleshooting',
      description: 'Common issues and their solutions',
      icon: faWrench,
      articles: [
        {
          id: 16,
          title: 'Login problems',
          content: `Troubleshoot login issues:

1. Reset your password using "Forgot Password"
2. Clear browser cache and cookies
3. Try incognito/private mode
4. Disable browser extensions
5. Try different browser or app

If locked out, contact support with registered email.`,
          category: 'Troubleshooting',
          icon: faLock
        },
        {
          id: 17,
          title: 'App not working',
          content: 'If app crashes or freezes: Update to latest version, Restart your device, Clear app cache (Settings > Apps > Our App > Storage > Clear Cache), Reinstall the app, Check device compatibility (iOS 13+/Android 8+).',
          category: 'Troubleshooting',
          popular: true,
          icon: faWrench
        },
        {
          id: 18,
          title: 'Connection problems',
          content: 'For connectivity issues: Check internet connection, Switch between WiFi and mobile data, Restart router/modem, Check firewall/antivirus settings, Try different network. Report persistent issues with network diagnostics.',
          category: 'Troubleshooting',
          icon: faSync
        }
      ]
    }
  ];

  get popularArticles(): Article[] {
    return this.categories
      .flatMap(cat => cat.articles)
      .filter(article => article.popular)
      .slice(0, 6);
  }

  get filteredCategories(): Category[] {
    if (!this.searchQuery.trim()) {
      return this.categories;
    }

    const query = this.searchQuery.toLowerCase();
    return this.categories.filter(category =>
      category.title.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.articles.some(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      )
    ).map(category => ({
      ...category,
      articles: category.articles.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      )
    })).filter(category => category.articles.length > 0);
  }

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.simulateLoading();
  }

  simulateLoading(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  selectCategory(category: Category): void {
    this.selectedCategory = category;
    this.selectedArticle = null;
    this.scrollToTop();
  }

  selectArticle(article: Article): void {
    this.selectedArticle = article;
    this.scrollToTop();
  }

  backToCategories(): void {
    this.selectedCategory = null;
    this.selectedArticle = null;
  }

  backToArticles(): void {
    this.selectedArticle = null;
  }

  becomeAHost(): void {
    this.router.navigate(['/host']);
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  submitFeedback(isHelpful: boolean): void {
    console.log(`User feedback: ${isHelpful ? 'Helpful' : 'Not helpful'}`);
    // You can add logic here to send feedback to backend API
    // For now just show a thank you message or toast
    alert('Thank you for your feedback!');
  }
}