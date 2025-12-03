import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-host-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="host-experience-page">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1>Host an Experience</h1>
          <p>Earn money leading people on activities you love.</p>
          <button class="cta-btn">Let's go</button>
        </div>
      </div>

      <!-- Value Props -->
      <div class="value-props">
        <div class="prop-card">
          <div class="prop-image">
            <img src="https://a0.muscache.com/im/pictures/572d3f27-893d-4658-867c-947c94548d77.jpg" alt="Share your passion">
          </div>
          <h3>Share your passion</h3>
          <p>Lead a hike, teach a class, or host a food tour. It's up to you.</p>
        </div>
        <div class="prop-card">
          <div class="prop-image">
            <img src="https://a0.muscache.com/im/pictures/6b35824c-2205-4b30-a541-4179f1043d63.jpg" alt="Meet people">
          </div>
          <h3>Meet people</h3>
          <p>Connect with travelers from around the world and your local community.</p>
        </div>
        <div class="prop-card">
          <div class="prop-image">
            <img src="https://a0.muscache.com/im/pictures/f51f70fb-93b7-4974-86e8-1195b64f1d89.jpg" alt="Earn money">
          </div>
          <h3>Earn money</h3>
          <p>Create a new income stream doing what you love.</p>
        </div>
      </div>

      <!-- Categories -->
      <div class="categories-section">
        <h2>What kind of Experience will you host?</h2>
        <div class="category-grid">
          <div class="category-card">
            <span class="emoji">🎨</span>
            <h4>Arts & Culture</h4>
          </div>
          <div class="category-card">
            <span class="emoji">🍳</span>
            <h4>Food & Drink</h4>
          </div>
          <div class="category-card">
            <span class="emoji">🏃</span>
            <h4>Sports</h4>
          </div>
          <div class="category-card">
            <span class="emoji">🎵</span>
            <h4>Entertainment</h4>
          </div>
          <div class="category-card">
            <span class="emoji">🌿</span>
            <h4>Nature</h4>
          </div>
          <div class="category-card">
            <span class="emoji">🧘</span>
            <h4>Wellness</h4>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .host-experience-page {
      padding-top: 80px;
    }

    /* Hero */
    .hero {
      height: 600px;
      background-image: url('https://a0.muscache.com/im/pictures/ca392233-e96a-495f-8b9a-76d782cb414c.jpg');
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      align-items: center;
      padding: 0 80px;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.4);
    }

    .hero-content {
      position: relative;
      z-index: 1;
      color: white;
      max-width: 500px;
    }

    h1 {
      font-size: 64px;
      font-weight: 800;
      margin: 0 0 24px 0;
      line-height: 1.1;
    }

    .hero-content p {
      font-size: 20px;
      margin-bottom: 32px;
      font-weight: 500;
    }

    .cta-btn {
      background: #FF385C;
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .cta-btn:active {
      transform: scale(0.98);
    }

    /* Value Props */
    .value-props {
      max-width: 1280px;
      margin: 0 auto;
      padding: 96px 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 48px;
    }

    .prop-card h3 {
      font-size: 24px;
      font-weight: 600;
      margin: 24px 0 12px 0;
      color: #222222;
    }

    .prop-card p {
      font-size: 16px;
      color: #717171;
      line-height: 1.5;
    }

    .prop-image {
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 3/2;
    }

    .prop-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Categories */
    .categories-section {
      background: #F7F7F7;
      padding: 96px 24px;
      text-align: center;
    }

    .categories-section h2 {
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 48px 0;
      color: #222222;
    }

    .category-grid {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 24px;
    }

    .category-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .category-card:hover {
      transform: translateY(-4px);
    }

    .emoji {
      font-size: 32px;
    }

    .category-card h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #222222;
    }

    @media (max-width: 768px) {
      .hero {
        padding: 0 24px;
        justify-content: center;
        text-align: center;
      }

      h1 {
        font-size: 40px;
      }

      .value-props {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HostExperienceComponent { }
