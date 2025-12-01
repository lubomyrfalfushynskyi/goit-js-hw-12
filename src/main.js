import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const loadMoreButton = document.querySelector('.load-more');

let currentQuery = '';
let currentPage = 1;
let totalHits = 0;

form.addEventListener('submit', handleSearch);
loadMoreButton.addEventListener('click', handleLoadMore);

async function handleSearch(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const query = formData.get('search-text').trim();

  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;
  
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        title: 'No results',
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
    } else {
      createGallery(data.hits);
      
      if (data.hits.length < totalHits && currentPage * 15 < totalHits) {
        showLoadMoreButton();
      }
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again!',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

async function handleLoadMore() {
  currentPage += 1;
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    
    createGallery(data.hits);
    
    // Smooth scroll
    const galleryItem = document.querySelector('.gallery-item');
    if (galleryItem) {
      const cardHeight = galleryItem.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
    
    // Check if we've reached the end
    if (currentPage * 15 >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        title: 'End of results',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again!',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}
