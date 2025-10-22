var currentPage = 'home';
var selections = { low: [], medium: [], high: [] };
var quantities = { low: {}, medium: {}, high: {} };
var ownershipSelections = { low: [], medium: [], high: [] };
var assetSelections = { low: [], medium: [], high: [] };
var selectedAssets = { low: {}, medium: {}, high: {} };
var assetImages = {
    'event-space': '../IMAGES/eventCenter.pdf',
    'primary-school': '../IMAGES/primarySchool.pdf',
    'secondary-education': '../IMAGES/specialEducation.pdf',
    'daycare': '../IMAGES/childhoodCare.pdf',
    'convenience-store': '../IMAGES/groceryStore.pdf',
    'resource-lab': '../IMAGES/resourceLab.pdf'
};

var assetNames = {
    'event-space': 'Event Space',
    'primary-school': 'Primary School',
    'secondary-education': 'Secondary Education',
    'daycare': 'Daycare',
    'convenience-store': 'Convenience Store',
    'resource-lab': 'Resource Lab'
};

var unitImages = {
    'studio': '../IMAGES/studioPlan.pdf',
    'one-bedroom': '../IMAGES/1bedPlan.pdf',
    'two-bedroom': '../IMAGES/2bedPlan.pdf',
    'three-bedroom': '../IMAGES/3bedPlan.pdf'
};

var unitNames = {
    'studio': 'Studio',
    'one-bedroom': 'One Bedroom',
    'two-bedroom': 'Two Bedroom',
    'three-bedroom': 'Three Bedroom'
};

var unitPrices = {
    'studio': 450000,           // ~3x from 165k
    'one-bedroom': 600000,      // ~3x from 220k
    'two-bedroom': 750000,      // ~3x from 275k
    'three-bedroom': 900000     // ~3x from 330k
};

var assetPrices = {
    'event-space': 1500000,           // 3x from 500k
    'primary-school': 6000000,        // 3x from 2M
    'secondary-education': 7500000,   // 3x from 2.5M
    'daycare': 2250000,               // 3x from 750k
    'convenience-store': 1200000,     // 3x from 400k
    'resource-lab': 1800000           // 3x from 600k
};

var budgets = {
    'low': 35000000,
    'medium': 50000000,
    'high': 75000000
};

var ownershipBudgetModifiers = {
    'clt': 1.0,      // Standard costs - no modification
    'private': 1.15, // +15% budget boost
    'public': 0.90   // -10% budget reduction
};

function toggleCheckbox(page, type, element) {
    element.classList.toggle('checked');
    var index = selections[page].indexOf(type);
    if (index > -1) {
        selections[page].splice(index, 1);
    } else {
        selections[page].push(type);
    }
    console.log(page + ' selections:', selections[page]);
}

function toggleUnitCard(page, type, card) {
    // Just toggle expansion
    card.classList.toggle('expanded');
}

function updateBudget(page) {
    console.log('DEBUG updateBudget - page:', page);
    console.log('DEBUG updateBudget - quantities[page]:', quantities[page]);

    var totalCost = 0;
    var totalUnits = 0;

    // Calculate total cost and units
    for (var unitType in quantities[page]) {
        var quantity = quantities[page][unitType];
        var price = unitPrices[unitType];
        console.log('DEBUG - unitType:', unitType, 'quantity:', quantity, 'price:', price);
        totalCost += quantity * price;
        totalUnits += quantity;
    }

    console.log('DEBUG - totalCost:', totalCost, 'totalUnits:', totalUnits);

    var budget = budgets[page];
    var remaining = budget - totalCost;

    // Update budget display
    var budgetElement = document.getElementById('budget-' + page);
    var unitsElement = document.getElementById('units-' + page);

    console.log('DEBUG - budgetElement:', budgetElement);
    console.log('DEBUG - unitsElement:', unitsElement);

    if (budgetElement) {
        budgetElement.textContent = '$' + remaining.toLocaleString();
    }
    if (unitsElement) {
        unitsElement.textContent = totalUnits;
    }

    // Add warning class if over budget
    if (remaining < 0) {
        budgetElement.classList.add('over-budget');
    } else {
        budgetElement.classList.remove('over-budget');
    }

    // Update unit mix breakdown
    var unitMixElement = document.getElementById('unit-mix-' + page);
    console.log('DEBUG - unitMixElement:', unitMixElement);

    if (totalUnits === 0) {
        unitMixElement.innerHTML = '<div class="unit-mix-empty">No units selected</div>';
    } else {
        var mixHTML = '';
        for (var unitType in quantities[page]) {
            var quantity = quantities[page][unitType];
            if (quantity > 0) {
                mixHTML += '<div class="unit-mix-item">';
                mixHTML += '<span class="unit-type">' + unitNames[unitType] + '</span>';
                mixHTML += '<span class="unit-count">' + quantity + '</span>';
                mixHTML += '</div>';
            }
        }
        console.log('DEBUG - mixHTML:', mixHTML);
        unitMixElement.innerHTML = mixHTML;
    }

    // Enable/disable Next button based on budget
    checkBudgetAndToggleButton(page, remaining);
}

function checkBudgetAndToggleButton(page, remaining) {
    // Find Next button on current page
    var button = document.querySelector('#' + page + 'Content .next-btn-bottom');
    if (button) {
        if (remaining < 0) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'Over budget! Reduce units or assets.';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.title = '';
        }
    }
}

function changeQuantity(page, type, change) {
    var inputId = 'qty-' + page + '-' + type;
    var input = document.getElementById(inputId);
    var currentValue = parseInt(input.value) || 0;
    var newValue = Math.max(0, currentValue + change);

    input.value = newValue;

    // Ensure page exists in quantities object
    if (!quantities[page]) {
        quantities[page] = {};
    }

    // Update quantities object
    if (newValue > 0) {
        quantities[page][type] = newValue;
        // Add to selections if not already there
        if (selections[page].indexOf(type) === -1) {
            selections[page].push(type);
        }
    } else {
        delete quantities[page][type];
        // Remove from selections
        var index = selections[page].indexOf(type);
        if (index > -1) {
            selections[page].splice(index, 1);
        }
    }

    console.log('DEBUG - page:', page, 'type:', type, 'newValue:', newValue);
    console.log('DEBUG - quantities[page]:', quantities[page]);
    console.log('DEBUG - calling updateBudget');

    // Update budget display
    updateBudget(page);

    console.log(page + ' selections:', selections[page]);
    console.log(page + ' quantities:', quantities[page]);
}

function goToSection3(page) {
    // Check if any units have been selected
    var totalUnits = 0;
    for (var unitType in quantities[page]) {
        totalUnits += quantities[page][unitType];
    }

    if (totalUnits === 0) {
        alert('Please select at least one housing type');
        return;
    }

    // Copy budget data to Section 3 receipt
    var totalCost = 0;
    for (var unitType in quantities[page]) {
        var quantity = quantities[page][unitType];
        var price = unitPrices[unitType];
        totalCost += quantity * price;
    }

    var budget = budgets[page];
    var remaining = budget - totalCost;

    // Update Section 3 receipt
    var budgetElement = document.getElementById('budget-s3-' + page);
    var unitsElement = document.getElementById('units-s3-' + page);
    var unitMixElement = document.getElementById('unit-mix-s3-' + page);

    if (budgetElement) {
        budgetElement.textContent = '$' + remaining.toLocaleString();
    }
    if (unitsElement) {
        unitsElement.textContent = totalUnits;
    }

    // Update unit mix
    if (totalUnits === 0) {
        unitMixElement.innerHTML = '<div class="unit-mix-empty">No units selected</div>';
    } else {
        var mixHTML = '';
        for (var unitType in quantities[page]) {
            var quantity = quantities[page][unitType];
            if (quantity > 0) {
                mixHTML += '<div class="unit-mix-item">';
                mixHTML += '<span class="unit-type">' + unitNames[unitType] + '</span>';
                mixHTML += '<span class="unit-count">' + quantity + '</span>';
                mixHTML += '</div>';
            }
        }
        unitMixElement.innerHTML = mixHTML;
    }

    // We don't need createSection3 anymore since we're not using image-boxes
    document.getElementById(page + 'Content').classList.add('hidden');
    document.getElementById('section3' + page.charAt(0).toUpperCase() + page.slice(1)).classList.remove('hidden');
    currentPage = page + '-section3';
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateBreadcrumb();
}

function createSection3(page, selectedTypes) {
    var container = document.getElementById('section3' + page.charAt(0).toUpperCase() + page.slice(1));
    var boxContainer = container.querySelector('.image-boxes');
    boxContainer.innerHTML = '';

    for (var i = 0; i < selectedTypes.length; i++) {
        var type = selectedTypes[i];
        var box = document.createElement('div');
        box.className = 'image-box';
        box.style.backgroundImage = 'url(' + unitImages[type] + ')';
        box.style.backgroundSize = 'cover';
        box.style.backgroundPosition = 'center';
        box.style.position = 'relative';

        var label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.bottom = '1rem';
        label.style.right = '1rem';
        label.style.color = '#666';
        label.style.fontSize = '1rem';
        label.style.fontWeight = '400';
        label.textContent = unitNames[type];

        box.appendChild(label);
        boxContainer.appendChild(box);
    }
}

function toggleOwnershipCard(page, type, card) {
    var container = card.closest('.section');
    var allCards = container.querySelectorAll('.ownership-card');
    var checkbox = card.querySelector('.simple-checkbox');

    if (card.classList.contains('selected')) {
        card.classList.toggle('expanded');
        return;
    }

    allCards.forEach(function(c) {
        c.classList.remove('selected');
        c.classList.remove('expanded');
        c.querySelector('.simple-checkbox').classList.remove('checked');
    });

    card.classList.add('selected');
    card.classList.add('expanded');
    checkbox.classList.add('checked');
    ownershipSelections[page] = [type];

    // Update ownership model on receipt
    var ownershipElement = document.getElementById('ownership-s3-' + page);
    var ownershipNames = {
        'clt': 'Community Land Trust',
        'private': 'Private Developer',
        'public': 'Public Developer'
    };

    if (ownershipElement) {
        ownershipElement.innerHTML = '<div class="ownership-selected">' + ownershipNames[type] + '</div>';
    }

    // Recalculate budget with ownership modifier
    var baseBudget = budgets[page];
    var modifier = ownershipBudgetModifiers[type];
    var adjustedBudget = baseBudget * modifier;

    // Calculate unit costs
    var totalCost = 0;
    for (var unitType in quantities[page]) {
        var quantity = quantities[page][unitType];
        var price = unitPrices[unitType];
        totalCost += quantity * price;
    }

    var remaining = adjustedBudget - totalCost;

    // Update budget display on receipt
    var budgetElement = document.getElementById('budget-s3-' + page);
    if (budgetElement) {
        budgetElement.textContent = '$' + remaining.toLocaleString();

        // Add warning class if over budget
        if (remaining < 0) {
            budgetElement.classList.add('over-budget');
        } else {
            budgetElement.classList.remove('over-budget');
        }
    }

    console.log(page + ' ownership selection:', ownershipSelections[page]);
    console.log('Base budget:', baseBudget, 'Modifier:', modifier, 'Adjusted:', adjustedBudget, 'Remaining:', remaining);

    // Enable/disable Next button for Section 3
    var button = document.querySelector('#section3' + page.charAt(0).toUpperCase() + page.slice(1) + ' .next-btn-bottom');
    if (button) {
        if (remaining < 0) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'Over budget! Go back and reduce units.';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.title = '';
        }
    }
}

function toggleAssetCard(page, assetType, card) {
    var checkbox = card.querySelector('.simple-checkbox');

    // Toggle selection
    if (selectedAssets[page][assetType]) {
        // Deselect
        delete selectedAssets[page][assetType];
        checkbox.classList.remove('checked');
        card.classList.remove('selected');
    } else {
        // Select
        selectedAssets[page][assetType] = true;
        checkbox.classList.add('checked');
        card.classList.add('selected');
    }

    // Update budget on receipt
    updateAssetBudget(page);
}

function updateAssetBudget(page) {
    // Calculate total asset cost
    var totalAssetCost = 0;
    var assetCount = 0;
    for (var assetType in selectedAssets[page]) {
        if (selectedAssets[page][assetType]) {
            totalAssetCost += assetPrices[assetType];
            assetCount++;
        }
    }

    // Get base budget with ownership modifier
    var baseBudget = budgets[page];
    var ownershipType = ownershipSelections[page][0];
    var modifier = ownershipType ? ownershipBudgetModifiers[ownershipType] : 1.0;
    var adjustedBudget = baseBudget * modifier;

    // Calculate unit costs
    var totalUnitCost = 0;
    for (var unitType in quantities[page]) {
        var quantity = quantities[page][unitType];
        var price = unitPrices[unitType];
        totalUnitCost += quantity * price;
    }

    var remaining = adjustedBudget - totalUnitCost - totalAssetCost;

    // Update remaining budget
    var budgetElement = document.getElementById('budget-s4-' + page);
    if (budgetElement) {
        budgetElement.textContent = '$' + remaining.toLocaleString();

        if (remaining < 0) {
            budgetElement.classList.add('over-budget');
        } else {
            budgetElement.classList.remove('over-budget');
        }
    }

    // Update asset breakdown
    var assetMixElement = document.getElementById('asset-mix-s4-' + page);
    if (assetCount === 0) {
        assetMixElement.innerHTML = '<div class="asset-empty">No assets selected</div>';
    } else {
        var mixHTML = '';
        for (var assetType in selectedAssets[page]) {
            if (selectedAssets[page][assetType]) {
                mixHTML += '<div class="asset-item">';
                mixHTML += '<span class="asset-name">' + assetNames[assetType] + '</span>';
                mixHTML += '<span class="asset-cost">$' + assetPrices[assetType].toLocaleString() + '</span>';
                mixHTML += '</div>';
            }
        }
        assetMixElement.innerHTML = mixHTML;
    }

    // Enable/disable Next button for Section 4
    var button = document.querySelector('#section4' + page.charAt(0).toUpperCase() + page.slice(1) + ' .next-btn-bottom');
    if (button) {
        if (remaining < 0) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'Over budget! Deselect some assets or go back to reduce units.';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.title = '';
        }
    }
}

function goToSection5(page) {
    var selected = ownershipSelections[page];
    if (selected.length === 0) {
        alert('Please select at least one ownership model');
        return;
    }

    // Populate Section 4 receipt with data from previous sections
    var baseBudget = budgets[page];
    var ownershipType = ownershipSelections[page][0];
    var modifier = ownershipType ? ownershipBudgetModifiers[ownershipType] : 1.0;
    var adjustedBudget = baseBudget * modifier;

    // Calculate unit costs and total units
    var totalUnitCost = 0;
    var totalUnits = 0;
    for (var unitType in quantities[page]) {
        var quantity = quantities[page][unitType];
        var price = unitPrices[unitType];
        totalUnitCost += quantity * price;
        totalUnits += quantity;
    }

    var remaining = adjustedBudget - totalUnitCost;

    // Update Section 4 receipt budget info
    var budgetElement = document.getElementById('budget-s4-' + page);
    var unitsElement = document.getElementById('units-s4-' + page);

    if (budgetElement) {
        budgetElement.textContent = '$' + remaining.toLocaleString();
    }
    if (unitsElement) {
        unitsElement.textContent = totalUnits;
    }

    // Update unit mix
    var unitMixElement = document.getElementById('unit-mix-s4-' + page);
    if (totalUnits === 0) {
        unitMixElement.innerHTML = '<div class="unit-mix-empty">No units selected</div>';
    } else {
        var mixHTML = '';
        for (var unitType in quantities[page]) {
            var quantity = quantities[page][unitType];
            if (quantity > 0) {
                mixHTML += '<div class="unit-mix-item">';
                mixHTML += '<span class="unit-type">' + unitNames[unitType] + '</span>';
                mixHTML += '<span class="unit-count">' + quantity + '</span>';
                mixHTML += '</div>';
            }
        }
        unitMixElement.innerHTML = mixHTML;
    }

    // Update ownership model
    var ownershipElement = document.getElementById('ownership-s4-' + page);
    var ownershipNames = {
        'clt': 'Community Land Trust',
        'private': 'Private Developer',
        'public': 'Public Developer'
    };

    if (ownershipElement && ownershipType) {
        ownershipElement.innerHTML = '<div class="ownership-selected">' + ownershipNames[ownershipType] + '</div>';
    }

    document.getElementById('section3' + page.charAt(0).toUpperCase() + page.slice(1)).classList.add('hidden');
    document.getElementById('section4' + page.charAt(0).toUpperCase() + page.slice(1)).classList.remove('hidden');
    currentPage = page + '-section4';
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateBreadcrumb();
}

function toggleAsset(page, type, element) {
    element.classList.toggle('checked');
    var index = assetSelections[page].indexOf(type);
    if (index > -1) {
        assetSelections[page].splice(index, 1);
    } else {
        assetSelections[page].push(type);
    }
    console.log(page + ' asset selections:', assetSelections[page]);
}

function goToAssetDetails(page) {
    // Navigate to layout page instead
    createLayoutIcons(page);

    document.getElementById('section4' + page.charAt(0).toUpperCase() + page.slice(1)).classList.add('hidden');
    document.getElementById('layout' + page.charAt(0).toUpperCase() + page.slice(1)).classList.remove('hidden');
    currentPage = page + '-layout';
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateBreadcrumb();
}

function createAssetDetails(page, selectedAssets) {
    var container = document.getElementById('assetDetails' + page.charAt(0).toUpperCase() + page.slice(1));
    var boxContainer = container.querySelector('.image-boxes');
    boxContainer.innerHTML = '';

    for (var i = 0; i < selectedAssets.length; i++) {
        var type = selectedAssets[i];
        var box = document.createElement('div');
        box.className = 'image-box';
        box.style.backgroundImage = 'url(' + assetImages[type] + ')';
        box.style.backgroundSize = 'cover';
        box.style.backgroundPosition = 'center';
        box.style.position = 'relative';

        var label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.bottom = '1rem';
        label.style.right = '1rem';
        label.style.color = '#666';
        label.style.fontSize = '1rem';
        label.style.fontWeight = '400';
        label.textContent = assetNames[type];

        box.appendChild(label);
        boxContainer.appendChild(box);
    }
}

function completeProject(page) {
    // Build the summary text
    var unitTypes = selections[page].map(function(type) {
        return unitNames[type];
    }).join(', ');

    var ownership = ownershipSelections[page][0];
    var ownershipText = '';
    if (ownership === 'clt') ownershipText = 'Community Land Trust';
    else if (ownership === 'private') ownershipText = 'Private Developer';
    else if (ownership === 'public') ownershipText = 'Public Developer';

    var assets = assetSelections[page].map(function(type) {
        return assetNames[type];
    }).join(', ');

    var summaryText = 'Affordable Living Community Comprised of ' + unitTypes +
                      ' Governed by a ' + ownershipText +
                      ' Featuring ' + assets;

    // Update the summary page
    document.getElementById('summaryTitle').textContent = summaryText;

    // Hide asset details, show summary
    document.getElementById('assetDetails' + page.charAt(0).toUpperCase() + page.slice(1)).classList.add('hidden');
    document.getElementById('summaryPage').classList.remove('hidden');

    currentPage = 'summary';
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateBreadcrumb();
}

function goToHome() {
    location.reload();
}

function goBackToSection3(page) {
    document.getElementById('section4' + page.charAt(0).toUpperCase() + page.slice(1)).classList.add('hidden');
    document.getElementById('section3' + page.charAt(0).toUpperCase() + page.slice(1)).classList.remove('hidden');
    currentPage = page + '-section3';
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateBreadcrumb();
}

function updateBreadcrumb() {
    var breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '<span class="breadcrumb-item breadcrumb-clickable" onclick="goToHome()">Home</span>';

    var parts = currentPage.split('-');
    var page = parts[0]; // low, medium, high

    var budgetNames = {
        'low': '$35M Budget',
        'medium': '$50M Budget',
        'high': '$75M Budget'
    };

    if (currentPage === 'low' || currentPage === 'medium' || currentPage === 'high') {
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-current">' + budgetNames[page] + '</span>';
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-current">Section 2: Housing Types</span>';
    } else if (currentPage === 'low-section3' || currentPage === 'medium-section3' || currentPage === 'high-section3') {
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-clickable" onclick="goToPage(\'' + page + '\')">' + budgetNames[page] + '</span>';
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-clickable" onclick="goToPage(\'' + page + '\')">Section 2: Housing Types</span>';
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-current">Section 3: Ownership Model</span>';
    } else if (currentPage === 'low-section4' || currentPage === 'medium-section4' || currentPage === 'high-section4') {
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-clickable" onclick="goToPage(\'' + page + '\')">' + budgetNames[page] + '</span>';
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-clickable" onclick="goToPage(\'' + page + '\')">Section 2: Housing Types</span>';
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-clickable" onclick="goBackToSection3(\'' + page + '\')">Section 3: Ownership Model</span>';
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-current">Section 4: Community Assets</span>';
    } else if (currentPage === 'summary') {
        breadcrumb.innerHTML += ' › <span class="breadcrumb-item breadcrumb-current">Project Summary</span>';
    }
}

function goToPage(page) {
    currentPage = page;
    document.getElementById('homeContent').classList.add('hidden');
    document.getElementById('lowContent').classList.add('hidden');
    document.getElementById('mediumContent').classList.add('hidden');
    document.getElementById('highContent').classList.add('hidden');
    document.getElementById('section3Low').classList.add('hidden');
    document.getElementById('section3Medium').classList.add('hidden');
    document.getElementById('section3High').classList.add('hidden');
    document.getElementById('section4Low').classList.add('hidden');
    document.getElementById('section4Medium').classList.add('hidden');
    document.getElementById('section4High').classList.add('hidden');
    document.getElementById('assetDetailsLow').classList.add('hidden');
    document.getElementById('assetDetailsMedium').classList.add('hidden');
    document.getElementById('assetDetailsHigh').classList.add('hidden');
    if (page === 'home') {
        document.getElementById('homeContent').classList.remove('hidden');
    } else if (page === 'low') {
        document.getElementById('lowContent').classList.remove('hidden');
    } else if (page === 'medium') {
        document.getElementById('mediumContent').classList.remove('hidden');
    } else if (page === 'high') {
        document.getElementById('highContent').classList.remove('hidden');
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateBreadcrumb();
    document.getElementById('summaryPage').classList.add('hidden');
}

// Initialize breadcrumb on page load
updateBreadcrumb();

// Cover page advancement function
function advanceCover(coverNumber) {
    // Hide all cover pages
    document.getElementById('cover1').classList.add('hidden');
    document.getElementById('cover2').classList.add('hidden');
    document.getElementById('cover3').classList.add('hidden');

    // Show the requested cover page
    document.getElementById('cover' + coverNumber).classList.remove('hidden');
}

// Layout page functions
function createLayoutIcons(page) {
    var canvas = document.getElementById('layout-canvas-' + page);
    canvas.innerHTML = ''; // Clear previous icons

    var iconIndex = 0;
    var gridSize = 80; // Space between icons

    // Create icons for each unit
    for (var unitType in quantities[page]) {
        var quantity = quantities[page][unitType];
        for (var i = 0; i < quantity; i++) {
            var icon = document.createElement('div');
            icon.className = 'layout-icon layout-icon-' + unitType;
            icon.textContent = unitNames[unitType];
            icon.draggable = true;
            icon.id = 'icon-' + page + '-' + unitType + '-' + i;

            // Position icons in a grid initially
            var col = iconIndex % 10;
            var row = Math.floor(iconIndex / 10);
            icon.style.left = (col * gridSize + 20) + 'px';
            icon.style.top = (row * gridSize + 20) + 'px';

            canvas.appendChild(icon);
            iconIndex++;
        }
    }

    // Create icons for each selected asset
    for (var assetType in selectedAssets[page]) {
        if (selectedAssets[page][assetType]) {
            var icon = document.createElement('div');
            icon.className = 'layout-icon layout-icon-asset';
            icon.textContent = assetNames[assetType];
            icon.draggable = true;
            icon.id = 'icon-' + page + '-asset-' + assetType;

            // Position icons in a grid
            var col = iconIndex % 10;
            var row = Math.floor(iconIndex / 10);
            icon.style.left = (col * gridSize + 20) + 'px';
            icon.style.top = (row * gridSize + 20) + 'px';

            canvas.appendChild(icon);
            iconIndex++;
        }
    }

    // Enable drag and drop
    enableDragAndDrop(canvas);
}

function enableDragAndDrop(canvas) {
    var draggedElement = null;
    var offsetX = 0;
    var offsetY = 0;

    canvas.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('layout-icon')) {
            draggedElement = e.target;
            draggedElement.classList.add('dragging');

            // Calculate offset from cursor to element position
            var rect = draggedElement.getBoundingClientRect();
            var canvasRect = canvas.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        }
    });

    canvas.addEventListener('dragend', function(e) {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
    });

    canvas.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        if (draggedElement) {
            var canvasRect = canvas.getBoundingClientRect();
            var x = e.clientX - canvasRect.left - offsetX;
            var y = e.clientY - canvasRect.top - offsetY;

            // Constrain to canvas bounds
            x = Math.max(0, Math.min(x, canvasRect.width - draggedElement.offsetWidth));
            y = Math.max(0, Math.min(y, canvasRect.height - draggedElement.offsetHeight));

            draggedElement.style.left = x + 'px';
            draggedElement.style.top = y + 'px';
        }
    });
}

function finishLayout(page) {
    // For now, just navigate to summary or next section
    alert('Layout saved! This would proceed to the next section.');
    // TODO: Save layout positions and continue to summary
}
