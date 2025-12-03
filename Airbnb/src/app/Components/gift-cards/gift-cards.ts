import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gift-cards-page">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>Airbnb Gift Cards</h1>
          <p class="hero-subtitle">Give the gift of getaway. The perfect present for anyone, anywhere.</p>
          <div class="cta-buttons">
            <button class="btn-primary">Buy a gift card</button>
            <button class="btn-secondary">Redeem</button>
          </div>
        </div>
        <div class="hero-image">
          <!-- Placeholder for gift card art -->
          <div class="card-art">
            <div class="logo">airbnb</div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <div class="feature-card">
          <div class="icon">🎁</div>
          <h3>Easy to give</h3>
          <p>Send a digital card instantly or schedule it for a special date.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🌍</div>
          <h3>Easy to use</h3>
          <p>Apply to any stay or Experience, anywhere in the world.</p>
        </div>
        <div class="feature-card">
          <div class="icon">♾️</div>
          <h3>No expiration</h3>
          <p>Our gift cards never expire, so they can plan the perfect trip.</p>
        </div>
      </div>

      <!-- Corporate Gifting -->
      <div class="corporate-section">
        <div class="corporate-content">
          <h2>Corporate Gifting</h2>
          <p>Treat your employees or customers to a trip of a lifetime. Bulk buying made simple.</p>
          <button class="btn-outline">Learn more</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gift-cards-page {
      padding-top: 80px;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #FF385C 0%, #BD1E59 100%);
      color: white;
      padding: 80px 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 64px;
      min-height: 500px;
    }

    .hero-content {
      max-width: 500px;
    }

    h1 {
      font-size: 56px;
      font-weight: 800;
      margin: 0 0 24px 0;
      line-height: 1.1;
    }

    .hero-subtitle {
      font-size: 20px;
      margin-bottom: 32px;
      opacity: 0.9;
      line-height: 1.4;
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
    }

    .btn-primary {
      background: white;
      color: #FF385C;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .btn-primary:active {
      transform: scale(0.98);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid white;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .card-art {
      width: 400px;
      height: 250px;
      background: white;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      transform: rotate(-5deg);
    }

    .logo {
      font-size: 48px;
      font-weight: 800;
      color: #FF385C;
    }

    /* Features Section */
    .features-section {
      max-width: 1280px;
      margin: 0 auto;
      padding: 80px 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 48px;
    }

    .feature-card {
      text-align: center;
    }

    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #222222;
    }

    .feature-card p {
      font-size: 16px;
      color: #717171;
      line-height: 1.5;
    }

    /* Corporate Section */
    .corporate-section {
      background: #F7F7F7;
      padding: 80px 24px;
      text-align: center;
    }

    .corporate-content {
      max-width: 600px;
      margin: 0 auto;
    }

    .corporate-content h2 {
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 16px 0;
      color: #222222;
    }

    .corporate-content p {
      font-size: 18px;
      color: #717171;
      margin-bottom: 32px;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid #222222;
      color: #222222;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-outline:hover {
      background: #f1f1f1;
    }

    @media (max-width: 900px) {
      .hero-section {
        flex-direction: column;
        text-align: center;
        gap: 48px;
      }

      .card-art {
        width: 300px;
        height: 190px;
      }

      .features-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GiftCardsComponent { }
