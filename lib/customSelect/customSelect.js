
export function initCustomSelects() {
    console.log("test2")

    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(customSelect => {
        const selected = customSelect.querySelector('.selected-option');
        const optionsList = customSelect.querySelector('.options-list');
        const options = optionsList.querySelectorAll('.option-item'); // Now spans inside div
        const hiddenInput = customSelect.querySelector('input.selectOutput');

        // Initialize ARIA roles and states, ensure first option is selected
        options.forEach((option, i) => {
            option.setAttribute('role', 'option');
            option.setAttribute('tabindex', '-1');
            if (i === 0) {
                option.setAttribute('aria-selected', 'true');
                selected.textContent = option.textContent;
                if (hiddenInput) hiddenInput.value = option.getAttribute('data-value') || option.textContent;
            } else {
                option.setAttribute('aria-selected', 'false');
            }
        });

        customSelect.setAttribute('aria-haspopup', 'listbox');
        customSelect.setAttribute('aria-expanded', 'false');
        customSelect.setAttribute('role', 'combobox');

        // Helper functions to open/close dropdown
        function closeDropdown() {
            optionsList.classList.remove('open');
            customSelect.setAttribute('aria-expanded', 'false');
        }

        function openDropdown() {
            optionsList.classList.add('open');
            customSelect.setAttribute('aria-expanded', 'true');
            const selectedOption = optionsList.querySelector('[aria-selected="true"]');
            if (selectedOption) selectedOption.focus();
            else options[0].focus();
        }

        function toggleDropdown() {
            if (optionsList.classList.contains('open')) closeDropdown();
            else openDropdown();
        }

        // Toggle dropdown on click except when clicking option
        customSelect.addEventListener('click', e => {
            if (e.target.closest('.option-item')) return;
            toggleDropdown();
        });

        // Click on options
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
                option.setAttribute('aria-selected', 'true');
                selected.textContent = option.textContent;
                if (hiddenInput) hiddenInput.value = option.getAttribute('data-value') || option.textContent;
                closeDropdown();
                customSelect.focus();

                const changeEvent = new Event('change', { bubbles: true });
                customSelect.dispatchEvent(changeEvent);
                hiddenInput.dispatchEvent(changeEvent);
            });

            option.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    let nextIndex = Array.from(options).indexOf(option) + 1;
                    if (nextIndex >= options.length) nextIndex = 0;
                    options[nextIndex].focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    let prevIndex = Array.from(options).indexOf(option) - 1;
                    if (prevIndex < 0) prevIndex = options.length - 1;
                    options[prevIndex].focus();
                } else if (e.key === 'Escape') {
                    closeDropdown();
                    customSelect.focus();
                }
            });
        });

        // Keyboard navigation on custom select container
        customSelect.addEventListener('keydown', e => {
            const visible = optionsList.classList.contains('open');
            const currentIndex = Array.from(options).findIndex(opt => opt.getAttribute('aria-selected') === 'true');

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!visible) openDropdown();
                else {
                    if (document.activeElement === customSelect) openDropdown();
                    else {
                        const focusedOption = document.activeElement;
                        if (focusedOption && focusedOption.classList.contains('option-item')) {
                            focusedOption.click();
                        }
                    }
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!visible) openDropdown();
                else {
                    let nextIndex = currentIndex + 1;
                    if (nextIndex >= options.length) nextIndex = 0;
                    options[nextIndex].focus();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!visible) openDropdown();
                else {
                    let prevIndex = currentIndex - 1;
                    if (prevIndex < 0) prevIndex = options.length - 1;
                    options[prevIndex].focus();
                }
            } else if (e.key === 'Escape') {
                if (visible) {
                    closeDropdown();
                    customSelect.focus();
                }
            }
        });

        // Close dropdown on outside click
        document.addEventListener('click', e => {
            if (!customSelect.contains(e.target)) closeDropdown();
        });

        // Initially closed
        closeDropdown();
    });
}
