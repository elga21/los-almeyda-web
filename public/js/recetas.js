document.addEventListener('DOMContentLoaded', () => {
    const recipesContainer = document.getElementById('recipes-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const recipeModal = document.getElementById('recipe-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');
    const API_BASE_URL = `${window.location.origin}/api`;

    // Función para mostrar/ocultar spinner
    function toggleLoading(show) {
        if (loadingSpinner) {
            loadingSpinner.style.display = show ? 'flex' : 'none';
        }
    }

    // Función para abrir el modal con detalles de la receta
    function openModal(recipe) {
        modalContent.innerHTML = `
            <img src="${recipe.imagen_url || 'https://placehold.co/800x400?text=Receta'}" alt="${recipe.titulo}" class="w-full h-64 object-cover rounded-lg mb-6">
            <h2 class="text-3xl font-bold text-red-700 mb-4">${recipe.titulo}</h2>
            <p class="text-gray-700 mb-6 italic">${recipe.descripcion || ''}</p>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Ingredientes</h3>
                    <ul class="list-disc list-inside text-gray-700 space-y-1">
                        ${recipe.ingredientes.split('\n').map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Preparación</h3>
                    <div class="text-gray-700 space-y-2 whitespace-pre-line">
                        ${recipe.instrucciones}
                    </div>
                </div>
            </div>
        `;
        recipeModal.classList.remove('hidden');
    }

    // Cerrar modal
    closeModalBtn.addEventListener('click', () => {
        recipeModal.classList.add('hidden');
    });

    // Cerrar modal al hacer clic fuera
    recipeModal.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            recipeModal.classList.add('hidden');
        }
    });

    // Renderizar recetas
    function renderRecipes(recipes) {
        recipesContainer.innerHTML = '';

        if (recipes.length === 0) {
            recipesContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">No hay recetas disponibles por el momento.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer';
            card.innerHTML = `
                <img src="${recipe.imagen_url || 'https://placehold.co/400x300?text=Receta'}" alt="${recipe.titulo}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${recipe.titulo}</h3>
                    <p class="text-gray-600 text-sm line-clamp-3">${recipe.descripcion || 'Sin descripción'}</p>
                    <button class="mt-4 text-red-600 font-semibold hover:text-red-800">Ver Receta Completa &rarr;</button>
                </div>
            `;

            card.addEventListener('click', () => openModal(recipe));
            recipesContainer.appendChild(card);
        });
    }

    // Obtener recetas del backend
    async function fetchRecipes() {
        toggleLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/recetas`);
            if (!response.ok) throw new Error('Error al cargar recetas');
            const recipes = await response.json();
            renderRecipes(recipes);
        } catch (error) {
            console.error(error);
            recipesContainer.innerHTML = '<p class="text-center text-red-600 col-span-full">Error al cargar las recetas.</p>';
        } finally {
            toggleLoading(false);
        }
    }

    fetchRecipes();
});
