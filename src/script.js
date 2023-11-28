import axios from 'axios';
import Notiflix from 'https://cdn.skypack.dev/notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '40911756-f65b6d1dd8fe00ae3d3aa7e29';
const API_URL = 'https://pixabay.com/api/';
const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let page = 1;

// Оголосіть lightbox як глобальну змінну
const lightbox = new SimpleLightbox('.gallery a');

searchForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const searchQuery = e.target.searchQuery.value.trim();

    if (searchQuery === '') {
        return;
    }

    page = 1;

    try {
        const images = await fetchImages(searchQuery, page);
        renderImages(images);
        lightbox.refresh();
    } catch (error) {
        console.error('Error fetching images:', error);
    }
});

loadMoreBtn.addEventListener('click', async function () {
    const searchQuery = searchForm.searchQuery.value.trim();

    if (searchQuery === '') {
        return;
    }

    try {
        page++;
        const images = await fetchImages(searchQuery, page);
        renderImages(images);
        lightbox.refresh();
    } catch (error) {
        console.error('Error fetching more images:', error);
    }
});

async function fetchImages(query, page) {
    try {
        const response = await axios.get(API_URL, {
            params: {
                key: apiKey,
                q: query,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
                page: page,
                per_page: 40,
            },
        });

        const { hits, totalHits } = response.data;

        if (totalHits === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            hideLoadMoreButton();
            return [];
        }

        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        showLoadMoreButton();

        return hits;
    } catch (error) {
        console.error('Error fetching images:', error);
        Notiflix.Notify.failure('An error occurred while fetching images. Please try again.');
        return [];
    }
}

function renderImages(images) {
    if (page === 1) {
        gallery.innerHTML = '';
    }

    images.forEach((image) => {
        const card = createImageCard(image);
        gallery.appendChild(card);
    });

    showLoadMoreButton();
    updateImageWidth();

    lightbox.refresh();
}

function createImageCard(image) {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.classList.add('info');
    info.innerHTML = `
        <p class="info-item"><b>Likes:</b> <span>${image.likes}</span></p>
        <p class="info-item"><b>Views:</b> <span>${image.views}</span></p>
        <p class="info-item"><b>Comments:</b> <span>${image.comments}</span></p>
        <p class="info-item"><b>Downloads:</b> <span>${image.downloads}</span></p>
    `;

    card.appendChild(img);
    card.appendChild(info);

    info.style.display = 'flex';
    info.style.width = '25%';
    info.style.gap = '5px';
    info.style.fontSize = '0.6em';
    info.style.textAlign = 'center';

    return card;
}

function showLoadMoreButton() {
    loadMoreBtn.style.display = 'block';
}

function hideLoadMoreButton() {
    loadMoreBtn.style.display = 'none';
}

function updateImageWidth() {
    const photoCards = document.querySelectorAll('.photo-card');

    photoCards.forEach((card) => {
        const img = card.querySelector('img');
        const containerWidth = card.clientWidth;

        img.style.width = containerWidth + 'px';
    });
}

