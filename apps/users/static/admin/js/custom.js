document.addEventListener('DOMContentLoaded', function() {
    // Add active class to current model in sidebar
    const currentModel = document.querySelector('.model-current');
    if (currentModel) {
        currentModel.closest('tr').classList.add('active');
    }
    
    // Enhance date pickers
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.type) {
            input.type = 'date';
        }
    });
    
    // Add confirmation to delete buttons
    const deleteButtons = document.querySelectorAll('.deletelink');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item?')) {
                e.preventDefault();
            }
        });
    });
});