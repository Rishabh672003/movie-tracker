document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addMovieForm = document.getElementById('add-movie-form');
    const moviesList = document.getElementById('movies-list');
    const searchInput = document.getElementById('search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const movieStatusSelect = document.getElementById('movie-status');
    const ratingContainer = document.getElementById('rating-container');
    const stars = document.querySelectorAll('.star');
    const movieRatingInput = document.getElementById('movie-rating');
    
    // State
    let movies = JSON.parse(localStorage.getItem('movies')) || [];
    let currentFilter = 'all';
    let editingMovieId = null;
    
    // Initialize
    renderMovies();
    
    // Event Listeners
    addMovieForm.addEventListener('submit', handleAddMovie);
    searchInput.addEventListener('input', handleSearch);
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;
            updateActiveFilterButton();
            renderMovies();
        });
    });
    
    movieStatusSelect.addEventListener('change', function() {
        if (this.value === 'watched') {
            ratingContainer.style.display = 'flex';
        } else {
            ratingContainer.style.display = 'none';
            movieRatingInput.value = 0;
            resetStarRating();
        }
    });
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            movieRatingInput.value = rating;
            updateStarRating(rating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(movieRatingInput.value);
            highlightStars(currentRating);
        });
    });
    
    // Functions
    function handleAddMovie(e) {
        e.preventDefault();
        
        const title = document.getElementById('movie-title').value.trim();
        const director = document.getElementById('movie-director').value.trim();
        const year = document.getElementById('movie-year').value;
        const status = document.getElementById('movie-status').value;
        const rating = status === 'watched' ? parseInt(movieRatingInput.value) : 0;
        
        if (!title) return;
        
        if (editingMovieId) {
            // Update existing movie
            const index = movies.findIndex(movie => movie.id === editingMovieId);
            if (index !== -1) {
                movies[index] = {
                    ...movies[index],
                    title,
                    director,
                    year,
                    status,
                    rating
                };
            }
            editingMovieId = null;
        } else {
            // Add new movie
            const newMovie = {
                id: Date.now().toString(),
                title,
                director,
                year,
                status,
                rating,
                addedDate: new Date().toISOString()
            };
            
            movies.unshift(newMovie);
        }
        
        saveMovies();
        renderMovies();
        resetForm();
    }
    
    function handleSearch() {
        renderMovies();
    }
    
    function renderMovies() {
        const searchTerm = searchInput.value.toLowerCase();
        
        let filteredMovies = movies.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm) || 
                                 (movie.director && movie.director.toLowerCase().includes(searchTerm));
            
            const matchesFilter = currentFilter === 'all' || movie.status === currentFilter;
            
            return matchesSearch && matchesFilter;
        });
        
        moviesList.innerHTML = '';
        
        if (filteredMovies.length === 0) {
            moviesList.innerHTML = '<div class="empty-message">No movies found</div>';
            return;
        }
        
        filteredMovies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            
            const statusClass = movie.status === 'watched' ? 'status-watched' : 'status-unwatched';
            const statusText = movie.status === 'watched' ? 'Watched' : 'Want to Watch';
            
            let ratingStars = '';
            if (movie.status === 'watched') {
                ratingStars = '<div class="movie-rating">';
                for (let i = 1; i <= 5; i++) {
                    ratingStars += `<span class="star ${i <= movie.rating ? 'active' : ''}">★</span>`;
                }
                ratingStars += '</div>';
            }
            
            movieCard.innerHTML = `
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-info">
                    ${movie.director ? `<p>Director: ${movie.director}</p>` : ''}
                    ${movie.year ? `<p>Year: ${movie.year}</p>` : ''}
                </div>
                <span class="movie-status ${statusClass}">${statusText}</span>
                ${ratingStars}
                <div class="movie-actions">
                    <button class="action-btn edit-btn" data-id="${movie.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${movie.id}">Delete</button>
                    <button class="action-btn toggle-btn" data-id="${movie.id}">
                        ${movie.status === 'watched' ? 'Mark Unwatched' : 'Mark Watched'}
                    </button>
                </div>
            `;
            
            moviesList.appendChild(movieCard);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditMovie);
        });
        
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteMovie);
        });
        
        document.querySelectorAll('.toggle-btn').forEach(button => {
            button.addEventListener('click', handleToggleStatus);
        });
    }
    
    function handleEditMovie(e) {
        const movieId = e.target.dataset.id;
        const movie = movies.find(m => m.id === movieId);
        
        if (movie) {
            document.getElementById('movie-title').value = movie.title;
            document.getElementById('movie-director').value = movie.director || '';
            document.getElementById('movie-year').value = movie.year || '';
            document.getElementById('movie-status').value = movie.status;
            
            if (movie.status === 'watched') {
                ratingContainer.style.display = 'flex';
                movieRatingInput.value = movie.rating;
                updateStarRating(movie.rating);
            } else {
                ratingContainer.style.display = 'none';
            }
            
            editingMovieId = movieId;
            document.querySelector('.add-movie-container h2').textContent = 'Edit Movie';
            document.querySelector('button[type="submit"]').textContent = 'Update Movie';
            
            // Scroll to form
            document.querySelector('.add-movie-container').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function handleDeleteMovie(e) {
        const movieId = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this movie?')) {
            movies = movies.filter(movie => movie.id !== movieId);
            saveMovies();
            renderMovies();
        }
    }
    
    function handleToggleStatus(e) {
        const movieId = e.target.dataset.id;
        const movieIndex = movies.findIndex(movie => movie.id === movieId);
        
        if (movieIndex !== -1) {
            const newStatus = movies[movieIndex].status === 'watched' ? 'unwatched' : 'watched';
            movies[movieIndex].status = newStatus;
            
            // If marking as watched, prompt for rating
            if (newStatus === 'watched' && movies[movieIndex].rating === 0) {
                const rating = prompt('Rate this movie from 1 to 5 stars:', '3');
                if (rating !== null) {
                    const parsedRating = parseInt(rating);
                    movies[movieIndex].rating = isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5 ? 0 : parsedRating;
                }
            }
            
            saveMovies();
            renderMovies();
        }
    }
    
    function resetForm() {
        addMovieForm.reset();
        movieRatingInput.value = 0;
        resetStarRating();
        ratingContainer.style.display = 'none';
        editingMovieId = null;
        document.querySelector('.add-movie-container h2').textContent = 'Add New Movie';
        document.querySelector('button[type="submit"]').textContent = 'Add Movie';
    }
    
    function updateStarRating(rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    function resetStarRating() {
        stars.forEach(star => star.classList.remove('active'));
    }
    
    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    function updateActiveFilterButton() {
        filterButtons.forEach(button => {
            if (button.dataset.filter === currentFilter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    function saveMovies() {
        localStorage.setItem('movies', JSON.stringify(movies));
    }
});
