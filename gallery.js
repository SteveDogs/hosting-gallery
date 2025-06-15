// Gallery Grid Management
class GalleryManager {
  constructor() {
    this.currentView = localStorage.getItem('gallery-view') || 'masonry';
    this.currentSort = localStorage.getItem('gallery-sort') || 'newest';
    this.currentFilter = 'all';
    this.imageList = document.querySelector('.image-list');
    this.images = [];
    this.filteredImages = [];
    this.searchTerm = '';
    
    if (!this.imageList) {
      console.error('Image list not found!');
      return;
    }
    
    this.init();
  }

  init() {
    this.loadImages();
    this.createGalleryControls();
    this.setView(this.currentView);
    this.setupEventListeners();
    this.createStatsBar();
    this.applyFiltersAndSort();
  }

  createGalleryControls() {
    const gallery = document.querySelector('.gallery');
    const h2 = gallery.querySelector('h2');
    
    if (document.querySelector('.gallery-header')) {
      return;
    }
    
    const header = document.createElement('div');
    header.className = 'gallery-header';
    header.appendChild(h2.cloneNode(true));
    h2.remove();
    
    const controls = document.createElement('div');
    controls.className = 'gallery-controls';
    controls.innerHTML = `
      <div class="view-toggle">
        <button class="view-btn" data-view="masonry" title="Masonry Grid">
          <i class="fas fa-th"></i>
        </button>
        <button class="view-btn" data-view="uniform" title="Uniform Grid">
          <i class="fas fa-border-all"></i>
        </button>
        <button class="view-btn" data-view="compact" title="Compact Grid">
          <i class="fas fa-grip"></i>
        </button>
        <button class="view-btn" data-view="list" title="List View">
          <i class="fas fa-list"></i>
        </button>
      </div>
      <select class="sort-select">
        <option value="newest">Сначала новые</option>
        <option value="oldest">Сначала старые</option>
        <option value="name-asc">Имя А-Я</option>
        <option value="name-desc">Имя Я-А</option>
        <option value="size-desc">Сначала большие</option>
        <option value="size-asc">Сначала маленькие</option>
      </select>
    `;
    
    header.appendChild(controls);
    
    const searchBar = document.createElement('div');
    searchBar.className = 'gallery-search';
    searchBar.innerHTML = `
      <input type="text" class="search-input" placeholder="Поиск изображений...">
      <div class="filter-tags">
        <button class="filter-tag active" data-filter="all">Все</button>
        <button class="filter-tag" data-filter="large">Большие</button>
        <button class="filter-tag" data-filter="recent">Недавние</button>
      </div>
    `;
    
    gallery.insertBefore(header, this.imageList);
    gallery.insertBefore(searchBar, this.imageList);
    
    const sortSelect = controls.querySelector('.sort-select');
    sortSelect.value = this.currentSort;
  }

  createStatsBar() {
    if (document.querySelector('.gallery-stats')) {
      return;
    }
    
    const statsBar = document.createElement('div');
    statsBar.className = 'gallery-stats';
    
    const gallery = document.querySelector('.gallery');
    gallery.insertBefore(statsBar, this.imageList);
    
    this.updateStats();
  }

  setupEventListeners() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.setView(view);
      });
    });

    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.setSort(sortSelect.value);
      });
    }

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.setSearchTerm(e.target.value);
      });
    }

    document.querySelectorAll('.filter-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        this.setFilter(tag.dataset.filter);
      });
    });

    document.querySelectorAll('.image-card').forEach(card => {
      const img = card.querySelector('img');
      if (img) {
        card.addEventListener('click', (e) => {
          if (!e.target.closest('.image-actions')) {
            this.openImagePreview(img.src, card);
          }
        });
      }
    });
  }

  setView(view) {
    this.currentView = view;
    localStorage.setItem('gallery-view', view);
    
    const imageList = document.querySelector('.image-list');
    if (!imageList) {
      return;
    }
    
    imageList.classList.remove('masonry', 'uniform', 'compact', 'list');
    imageList.offsetHeight;
    imageList.classList.add(view);
    
    this.updateActiveViewButton();
    this.updateStats();
    
    if (view === 'masonry') {
      setTimeout(() => this.initMasonryLayout(), 100);
    }
  }

  updateActiveViewButton() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === this.currentView);
    });
  }

  updateActiveFilter(filter) {
    document.querySelectorAll('.filter-tag').forEach(tag => {
      tag.classList.toggle('active', tag.dataset.filter === filter);
    });
  }

  setSort(sortType) {
    this.currentSort = sortType;
    localStorage.setItem('gallery-sort', sortType);
    this.applyFiltersAndSort();
  }

  setSearchTerm(term) {
    this.searchTerm = term.toLowerCase();
    this.applyFiltersAndSort();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.updateActiveFilter(filter);
    this.applyFiltersAndSort();
  }

  loadImages() {
    this.images = Array.from(document.querySelectorAll('.image-card')).map(card => {
      const img = card.querySelector('img');
      const nameEl = card.querySelector('.image-info p:first-child');
      
      let uploadTimestamp = Date.now();
      let fileSize = 0;
      
      if (card.dataset.uploadDate) {
        uploadTimestamp = parseInt(card.dataset.uploadDate) * 1000;
      }
      
      if (card.dataset.size) {
        fileSize = parseInt(card.dataset.size);
      }
      
      return {
        element: card,
        name: nameEl ? nameEl.textContent.replace(/^Size:|^Размер:/, '').trim() : '',
        size: fileSize,
        date: new Date(uploadTimestamp),
        src: img ? img.src : '',
        isLarge: fileSize > 1024 * 1024,
        isRecent: Date.now() - uploadTimestamp < 7 * 24 * 60 * 60 * 1000
      };
    });
    
    this.filteredImages = [...this.images];
  }

  applyFiltersAndSort() {
    let filtered = this.images.filter(image => {
      if (this.searchTerm) {
        return image.name.toLowerCase().includes(this.searchTerm);
      }
      return true;
    });

    if (this.currentFilter && this.currentFilter !== 'all') {
      filtered = filtered.filter(image => {
        switch (this.currentFilter) {
          case 'large':
            return image.isLarge;
          case 'recent':
            return image.isRecent;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return b.date - a.date;
        case 'oldest':
          return a.date - b.date;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-desc':
          return b.size - a.size;
        case 'size-asc':
          return a.size - b.size;
        default:
          return 0;
      }
    });

    this.filteredImages = filtered;
    this.updateDisplay();
  }

  updateDisplay() {
    this.images.forEach(image => {
      image.element.style.display = 'none';
    });

    this.filteredImages.forEach((image) => {
      image.element.style.display = '';
      this.imageList.appendChild(image.element);
    });

    this.updateStats();

    if (this.currentView === 'masonry') {
      setTimeout(() => this.initMasonryLayout(), 100);
    }
  }

  initMasonryLayout() {
    if (this.currentView !== 'masonry') return;

    const cards = this.imageList.querySelectorAll('.image-card:not([style*="display: none"])');
    
    cards.forEach(card => {
      const img = card.querySelector('img');
      if (img && img.complete) {
        this.setMasonryHeight(card);
      } else if (img) {
        img.addEventListener('load', () => this.setMasonryHeight(card));
      }
    });
  }

  setMasonryHeight(card) {
    const cardHeight = card.offsetHeight;
    const rowHeight = 10;
    const rowSpan = Math.ceil(cardHeight / rowHeight);
    card.style.setProperty('--grid-rows', rowSpan);
  }

  updateStats() {
    const statsBar = document.querySelector('.gallery-stats');
    if (!statsBar) return;
    
    const totalImages = this.images.length;
    const visibleImages = this.filteredImages.length;
    const totalSize = this.images.reduce((sum, img) => sum + img.size, 0);
    const formattedSize = this.formatBytes(totalSize);
    
    statsBar.innerHTML = `
      <div class="stats-left">
        <span><i class="fas fa-images"></i> ${visibleImages}${visibleImages !== totalImages ? ` из ${totalImages}` : ''} изображений</span>
        <span><i class="fas fa-hdd"></i> ${formattedSize}</span>
      </div>
      <div class="stats-right">
        Вид: ${this.getViewName(this.currentView)}
      </div>
    `;
  }

  getViewName(view) {
    const names = {
      masonry: 'Мозаика',
      uniform: 'Сетка',
      compact: 'Компактно',
      list: 'Список'
    };
    return names[view] || view;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  openImagePreview(src, card) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <button class="modal-close" onclick="this.closest('.image-modal').remove()">
          <i class="fas fa-times"></i>
        </button>
        <img src="${src}" alt="Preview" class="modal-image">
        <div class="modal-info">
          <h3>${card.querySelector('.image-info p:first-child').textContent}</h3>
          <p>${card.querySelector('.image-info p:nth-child(2)').textContent}</p>
          <p>${card.querySelector('.image-info p:nth-child(3)').textContent}</p>
          <div class="modal-actions">
            <button onclick="copyToClipboard('${card.querySelector('.image-info a').href.split('/').pop()}')" class="copy-btn">
              <i class="fa fa-copy"></i> Копировать ссылку
            </button>
            <a href="${src}" download class="copy-btn" style="text-decoration: none;">
              <i class="fa fa-download"></i> Скачать
            </a>
          </div>
        </div>
      </div>
    `;

    this.addModalStyles();
    document.body.appendChild(modal);

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  addModalStyles() {
    if (document.querySelector('#modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
      .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: modalFadeIn 0.3s ease;
      }
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
      }
      .modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        background: var(--glass-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        overflow: hidden;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
      }
      .modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(0, 0, 0, 0.7);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        transition: background 0.2s ease;
      }
      .modal-close:hover {
        background: rgba(0, 0, 0, 0.9);
      }
      .modal-image {
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
        display: block;
      }
      .modal-info {
        padding: 20px;
        background: var(--glass-bg);
      }
      .modal-info h3 {
        margin: 0 0 8px 0;
        color: var(--text-primary);
        font-size: 1.1rem;
        font-weight: 600;
      }
      .modal-info p {
        margin: 4px 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 16px;
      }
      @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @media (max-width: 768px) {
        .modal-content {
          max-width: 95vw;
          max-height: 95vh;
        }
        .modal-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(styles);
  }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.image-list')) {
    new GalleryManager();
  }
});