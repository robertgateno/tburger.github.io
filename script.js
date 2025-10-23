var currentPage = 'home';
var selections = { low: [], medium: [], high: [] };
var quantities = { low: {}, medium: {}, high: {} };
var ownershipSelections = { low: [], medium: [], high: [] };
var assetSelections = { low: [], medium: [], high: [] };
var selectedAssets = { low: {}, medium: {}, high: {} };
var assetImages = {
    'event-space': 'IMAGES/eventCenter.png',
    'primary-school': 'IMAGES/primarySchool.png',
    'secondary-education': 'IMAGES/specialEducation.png',
    'daycare': 'IMAGES/childhoodCare.png',
    'convenience-store': 'IMAGES/groceryStore.png',
    'resource-lab': 'IMAGES/resourceLab.png'
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
    'studio': 'IMAGES/studioPlan.png',
    'one-bedroom': 'IMAGES/1bedPlan.png',
    'two-bedroom': 'IMAGES/2bedPlan.png',
    'three-bedroom': 'IMAGES/3bedPlan.png'
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
    console.log('toggleOwnershipCard called - page:', page, 'type:', type);

    var container = card.closest('.section');
    var allCards = container.querySelectorAll('.ownership-card');
    var checkbox = card.querySelector('.simple-checkbox');

    if (card.classList.contains('selected')) {
        card.classList.toggle('expanded');
        console.log('Card already selected, toggling expansion');
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
    console.log('Ownership set for', page, ':', ownershipSelections[page]);

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

    // Enable Next button for Section 3 - ownership selection is valid
    var button = document.querySelector('#section3' + page.charAt(0).toUpperCase() + page.slice(1) + ' .next-btn-bottom');
    console.log('Next button found:', button, 'for page:', page);
    if (button) {
        // Always enable button once ownership is selected, even if over budget
        // User can proceed to assets section and adjust there
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.title = '';

        if (remaining < 0) {
            // Just show warning in title, but keep button enabled
            button.title = 'Warning: Over budget! You can adjust in the next section.';
        }
    }
}

function toggleAssetCard(page, assetType, cardOrEvent) {
    // Handle both direct card reference and event bubbling
    var card = cardOrEvent;
    if (cardOrEvent.target) {
        // This is an event object, find the card
        card = cardOrEvent.currentTarget || cardOrEvent.target.closest('.unit-compact-card') || cardOrEvent.target.closest('.asset-card');
    }

    if (!card) {
        console.error('Could not find card element');
        return;
    }

    var checkbox = card.querySelector('.simple-checkbox');

    // Toggle selection
    if (selectedAssets[page][assetType]) {
        // Deselect
        delete selectedAssets[page][assetType];
        if (checkbox) checkbox.classList.remove('checked');
        card.classList.remove('selected');
    } else {
        // Select
        selectedAssets[page][assetType] = true;
        if (checkbox) checkbox.classList.add('checked');
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

    // Update Section 4 receipt budget info (if elements exist)
    var budgetElement = document.getElementById('budget-s4-' + page);
    var unitsElement = document.getElementById('units-s4-' + page);

    if (budgetElement) {
        budgetElement.textContent = '$' + remaining.toLocaleString();
    }
    if (unitsElement) {
        unitsElement.textContent = totalUnits;
    }

    // Update unit mix (if element exists)
    var unitMixElement = document.getElementById('unit-mix-s4-' + page);
    if (unitMixElement) {
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
    }

    // Update ownership model (if element exists)
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

// Debug: Check if ownership next buttons exist and are enabled
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, checking buttons...');

    ['Low', 'Medium', 'High'].forEach(function(page) {
        var btn = document.querySelector('#section3' + page + ' .next-btn-bottom');
        console.log('Section3' + page + ' button:', btn);
        if (btn) {
            console.log('  - disabled:', btn.disabled);
            console.log('  - opacity:', btn.style.opacity);
        }
    });
});

// Cover page advancement function
function advanceCover(coverNumber) {
    // Hide all cover pages
    document.getElementById('cover1').classList.add('hidden');
    document.getElementById('cover2').classList.add('hidden');
    document.getElementById('cover3').classList.add('hidden');

    // Show the requested cover page
    document.getElementById('cover' + coverNumber).classList.remove('hidden');
}

// Street Grid Generation
function createStreetGrid(viewport) {
    var streetGrid = document.createElement('div');
    streetGrid.className = 'street-grid';

    var streetWidth = 40; // Width of streets
    var blockSize = 320; // Size of each city block (4 lots x 80px)
    var gridRows = 16; // 16x16 grid = 256 blocks
    var gridCols = 16;

    // Create horizontal streets (15 streets for 16 rows)
    for (var i = 1; i < gridRows; i++) {
        var streetEl = document.createElement('div');
        streetEl.className = 'street-h';
        streetEl.style.top = (blockSize * i + streetWidth * (i - 1)) + 'px';
        streetEl.style.height = streetWidth + 'px';
        streetGrid.appendChild(streetEl);
    }

    // Create vertical streets (15 streets for 16 columns)
    for (var j = 1; j < gridCols; j++) {
        var streetEl = document.createElement('div');
        streetEl.className = 'street-v';
        streetEl.style.left = (blockSize * j + streetWidth * (j - 1)) + 'px';
        streetEl.style.width = streetWidth + 'px';
        streetGrid.appendChild(streetEl);
    }

    // Create city blocks (256 blocks total)
    // Randomly select blocks to be parks (about 5-8% of blocks)
    var totalBlocks = gridRows * gridCols;
    var numParks = Math.floor(totalBlocks * 0.06); // 6% will be parks (~15 parks)
    var parkIndices = [];

    // Generate random unique park indices
    while (parkIndices.length < numParks) {
        var randomIndex = Math.floor(Math.random() * totalBlocks);
        if (parkIndices.indexOf(randomIndex) === -1) {
            parkIndices.push(randomIndex);
        }
    }

    var blockIndex = 0;
    for (var row = 0; row < gridRows; row++) {
        for (var col = 0; col < gridCols; col++) {
            var blockEl = document.createElement('div');

            // Check if this block should be a park
            var isPark = parkIndices.indexOf(blockIndex) !== -1;
            blockEl.className = isPark ? 'city-block park-block' : 'city-block';

            var top = row * (blockSize + streetWidth);
            var left = col * (blockSize + streetWidth);

            blockEl.style.top = top + 'px';
            blockEl.style.left = left + 'px';
            blockEl.style.width = blockSize + 'px';
            blockEl.style.height = blockSize + 'px';

            streetGrid.appendChild(blockEl);
            blockIndex++;
        }
    }

    viewport.appendChild(streetGrid);
}

// Layout page functions
function createLayoutIcons(page) {
    var viewport = document.getElementById('layout-viewport-' + page);
    viewport.innerHTML = ''; // Clear previous icons

    // Create street grid first
    createStreetGrid(viewport);

    // Initialize zoom
    applyZoom(page);

    var iconIndex = 0;
    var gridSize = 100; // Space between icons (increased for larger icons)

    // Create icons for each unit
    for (var unitType in quantities[page]) {
        var quantity = quantities[page][unitType];
        for (var i = 0; i < quantity; i++) {
            var icon = document.createElement('div');
            icon.className = 'layout-icon layout-icon-' + unitType;
            icon.draggable = true;
            icon.id = 'icon-' + page + '-' + unitType + '-' + i;

            // Set background image
            icon.style.backgroundImage = 'url(' + unitImages[unitType] + ')';

            // Add label
            var label = document.createElement('div');
            label.className = 'icon-label';
            label.textContent = unitNames[unitType];
            icon.appendChild(label);

            // Position icons in a grid initially
            var col = iconIndex % 8;
            var row = Math.floor(iconIndex / 8);
            icon.style.left = (col * gridSize + 20) + 'px';
            icon.style.top = (row * gridSize + 20) + 'px';

            // Add click handler for delete mode and select mode
            (function(iconElement) {
                iconElement.addEventListener('click', function() {
                    if (selectMode[page]) {
                        toggleIconSelection(page, iconElement);
                    } else {
                        deleteIcon(page, iconElement);
                    }
                });
            })(icon);

            viewport.appendChild(icon);
            iconIndex++;
        }
    }

    // Create icons for each selected asset
    for (var assetType in selectedAssets[page]) {
        if (selectedAssets[page][assetType]) {
            var icon = document.createElement('div');
            icon.className = 'layout-icon layout-icon-asset';
            icon.draggable = true;
            icon.id = 'icon-' + page + '-asset-' + assetType;

            // Set background image
            icon.style.backgroundImage = 'url(' + assetImages[assetType] + ')';

            // Add label
            var label = document.createElement('div');
            label.className = 'icon-label';
            label.textContent = assetNames[assetType];
            icon.appendChild(label);

            // Position icons in a grid
            var col = iconIndex % 8;
            var row = Math.floor(iconIndex / 8);
            icon.style.left = (col * gridSize + 20) + 'px';
            icon.style.top = (row * gridSize + 20) + 'px';

            // Add click handler for delete mode and select mode
            (function(iconElement) {
                iconElement.addEventListener('click', function() {
                    if (selectMode[page]) {
                        toggleIconSelection(page, iconElement);
                    } else {
                        deleteIcon(page, iconElement);
                    }
                });
            })(icon);

            viewport.appendChild(icon);
            iconIndex++;
        }
    }

    // Enable drag and drop
    enableDragAndDrop(viewport);

    // Calculate initial density
    updateDensityDisplay(page);

    // Setup zoom with mouse wheel
    setupZoom(page);

    // Enable canvas panning
    enableCanvasPan(page);
}

function calculateDensity(page) {
    var canvas = document.getElementById('layout-canvas-' + page);
    var icons = canvas.querySelectorAll('.layout-icon:not(.layout-icon-asset)'); // Only count unit icons, not assets

    if (icons.length < 2) {
        return { level: 'medium', percentage: 50 };
    }

    // Get positions of all unit icons
    var positions = [];
    icons.forEach(function(icon) {
        var rect = icon.getBoundingClientRect();
        var canvasRect = canvas.getBoundingClientRect();
        positions.push({
            x: rect.left - canvasRect.left + rect.width / 2,  // center x
            y: rect.top - canvasRect.top + rect.height / 2     // center y
        });
    });

    // Calculate average distance between all pairs of units
    var totalDistance = 0;
    var pairCount = 0;

    for (var i = 0; i < positions.length; i++) {
        for (var j = i + 1; j < positions.length; j++) {
            var dx = positions[i].x - positions[j].x;
            var dy = positions[i].y - positions[j].y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            totalDistance += distance;
            pairCount++;
        }
    }

    var avgDistance = totalDistance / pairCount;
    var canvasRect = canvas.getBoundingClientRect();
    var canvasSize = Math.sqrt(canvasRect.width * canvasRect.height);

    // Normalize the average distance as a percentage of canvas diagonal
    var normalizedDistance = avgDistance / canvasSize;

    // Convert to density percentage (inverse of distance)
    // Lower distance = higher density
    // Map normalized distance (0 to 1) to density percentage (100 to 0)
    var densityPercentage = Math.round((1 - normalizedDistance) * 100);

    // Clamp between 0 and 100
    densityPercentage = Math.max(0, Math.min(100, densityPercentage));

    // Determine density level based on percentage
    var level;
    if (densityPercentage >= 85) {
        level = 'very-high';
    } else if (densityPercentage >= 70) {
        level = 'high';
    } else if (densityPercentage >= 50) {
        level = 'medium';
    } else if (densityPercentage >= 30) {
        level = 'low';
    } else {
        level = 'very-low';
    }

    return { level: level, percentage: densityPercentage };
}

function updateDensityDisplay(page) {
    var densityInfo = calculateDensity(page);
    var percentageElement = document.getElementById('density-percentage-' + page);
    var barElement = document.getElementById('density-bar-' + page);

    if (percentageElement && barElement) {
        // Update percentage text
        percentageElement.textContent = densityInfo.percentage + '%';

        // Update bar width
        barElement.style.width = densityInfo.percentage + '%';

        // Remove all density classes
        barElement.classList.remove('very-low', 'low', 'medium', 'high', 'very-high');

        // Add the current density class for color
        barElement.classList.add(densityInfo.level);
    }
}

function enableDragAndDrop(viewport) {
    var draggedIcon = null;
    var isDraggingIcon = false;
    var startX = 0;
    var startY = 0;
    var iconStartX = 0;
    var iconStartY = 0;

    // Extract page name from viewport id (e.g., 'layout-viewport-low' -> 'low')
    var page = viewport.id.replace('layout-viewport-', '');

    // Use mousedown/mousemove/mouseup instead of drag events for better control
    viewport.addEventListener('mousedown', function(e) {
        // Check if clicking on an icon
        if (e.target.classList.contains('layout-icon') || e.target.closest('.layout-icon')) {
            var icon = e.target.classList.contains('layout-icon') ? e.target : e.target.closest('.layout-icon');

            // Don't drag if in select mode or trash mode
            if (selectMode[page] || trashMode[page]) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            draggedIcon = icon;
            isDraggingIcon = true;

            var scale = zoomLevel[page];
            var viewportRect = viewport.getBoundingClientRect();

            // Get current icon position
            iconStartX = parseFloat(icon.style.left) || 0;
            iconStartY = parseFloat(icon.style.top) || 0;

            // Store start mouse position
            startX = e.clientX;
            startY = e.clientY;

            icon.classList.add('dragging');
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isDraggingIcon && draggedIcon) {
            e.preventDefault();

            var scale = zoomLevel[page];
            var viewportRect = viewport.getBoundingClientRect();

            // Calculate mouse movement
            var deltaX = (e.clientX - startX) / scale;
            var deltaY = (e.clientY - startY) / scale;

            // Apply to icon position
            var newX = iconStartX + deltaX;
            var newY = iconStartY + deltaY;

            // Constrain to viewport bounds
            var maxX = viewport.offsetWidth - draggedIcon.offsetWidth;
            var maxY = viewport.offsetHeight - draggedIcon.offsetHeight;
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            draggedIcon.style.left = newX + 'px';
            draggedIcon.style.top = newY + 'px';
        }
    });

    document.addEventListener('mouseup', function(e) {
        if (isDraggingIcon && draggedIcon) {
            draggedIcon.classList.remove('dragging');

            // Update density after dragging stops
            updateDensityDisplay(page);

            draggedIcon = null;
            isDraggingIcon = false;
        }
    });
}

function finishLayout(page) {
    // For now, just navigate to summary or next section
    alert('Layout saved! This would proceed to the next section.');
    // TODO: Save layout positions and continue to summary
}

// Layout toolbar functions
var trashMode = { low: false, medium: false, high: false };
var selectMode = { low: false, medium: false, high: false };
var selectedIcons = { low: [], medium: [], high: [] };
var iconTransforms = {}; // Store rotation and flip state for each icon
var gridEnabled = { low: true, medium: true, high: true }; // Grid is on by default
var zoomLevel = { low: 1, medium: 1, high: 1 }; // Zoom level (start at 100%, 1:1 scale)

function resetLayout(page) {
    var canvas = document.getElementById('layout-canvas-' + page);
    var icons = canvas.querySelectorAll('.layout-icon');

    // Move all icons to top-left corner in a small cluster
    icons.forEach(function(icon, index) {
        var col = index % 5;
        var row = Math.floor(index / 5);
        icon.style.left = (col * 90 + 20) + 'px';
        icon.style.top = (row * 90 + 20) + 'px';
    });

    // Update density after reset
    updateDensityDisplay(page);
}

function distributeGrid(page) {
    // Default to medium density
    distributeGridWithDensity(page, 'medium');
}

function distributeGridWithDensity(page, densityLevel) {
    var canvas = document.getElementById('layout-canvas-' + page);
    var icons = canvas.querySelectorAll('.layout-icon');
    var canvasRect = canvas.getBoundingClientRect();

    var totalIcons = icons.length;
    var iconWidth = 80;
    var iconHeight = 80;

    var gridConfig;

    if (densityLevel === 'high') {
        // High Density: Tight clusters, use only ~30% of canvas space
        var useableWidth = canvasRect.width * 0.3;
        var useableHeight = canvasRect.height * 0.3;
        var paddingX = (canvasRect.width - useableWidth) / 2;
        var paddingY = (canvasRect.height - useableHeight) / 2;

        // Tighter grid spacing
        var cols = Math.ceil(Math.sqrt(totalIcons * 1.2)); // More columns for tighter packing
        var rows = Math.ceil(totalIcons / cols);

        var spacingX = useableWidth / cols;
        var spacingY = useableHeight / rows;

        gridConfig = {
            paddingX: paddingX,
            paddingY: paddingY,
            spacingX: spacingX,
            spacingY: spacingY,
            cols: cols
        };

    } else if (densityLevel === 'medium') {
        // Medium Density: Balanced distribution, use ~60% of canvas
        var useableWidth = canvasRect.width * 0.6;
        var useableHeight = canvasRect.height * 0.6;
        var paddingX = (canvasRect.width - useableWidth) / 2;
        var paddingY = (canvasRect.height - useableHeight) / 2;

        var cols = Math.ceil(Math.sqrt(totalIcons));
        var rows = Math.ceil(totalIcons / cols);

        var spacingX = useableWidth / cols;
        var spacingY = useableHeight / rows;

        gridConfig = {
            paddingX: paddingX,
            paddingY: paddingY,
            spacingX: spacingX,
            spacingY: spacingY,
            cols: cols
        };

    } else { // 'low' density
        // Low Density: Maximum spread, use ~95% of canvas
        var paddingX = 40;
        var paddingY = 40;
        var availableWidth = canvasRect.width - (2 * paddingX);
        var availableHeight = canvasRect.height - (2 * paddingY);

        // More spread out grid
        var cols = Math.ceil(Math.sqrt(totalIcons * 0.8)); // Fewer columns for more spread
        var rows = Math.ceil(totalIcons / cols);

        var spacingX = availableWidth / cols;
        var spacingY = availableHeight / rows;

        gridConfig = {
            paddingX: paddingX,
            paddingY: paddingY,
            spacingX: spacingX,
            spacingY: spacingY,
            cols: cols
        };
    }

    // Distribute icons in grid based on density configuration
    icons.forEach(function(icon, index) {
        var col = index % gridConfig.cols;
        var row = Math.floor(index / gridConfig.cols);

        var x = gridConfig.paddingX + (col * gridConfig.spacingX) + (gridConfig.spacingX - iconWidth) / 2;
        var y = gridConfig.paddingY + (row * gridConfig.spacingY) + (gridConfig.spacingY - iconHeight) / 2;

        icon.style.left = x + 'px';
        icon.style.top = y + 'px';
    });

    // Update density after distribution
    updateDensityDisplay(page);
}

function toggleTrashMode(page) {
    trashMode[page] = !trashMode[page];
    var trashBtn = document.getElementById('trash-btn-' + page);
    var canvas = document.getElementById('layout-canvas-' + page);
    var icons = canvas.querySelectorAll('.layout-icon');

    if (trashMode[page]) {
        trashBtn.classList.add('active');
        icons.forEach(function(icon) {
            icon.classList.add('delete-mode');
            icon.style.cursor = 'pointer';
        });
    } else {
        trashBtn.classList.remove('active');
        icons.forEach(function(icon) {
            icon.classList.remove('delete-mode');
            icon.style.cursor = 'move';
        });
    }
}

function deleteIcon(page, iconElement) {
    if (!trashMode[page]) return;

    // Extract unit/asset type from icon id
    var iconId = iconElement.id;
    var parts = iconId.split('-');

    if (parts[2] === 'asset') {
        // Asset icon: icon-{page}-asset-{assetType}
        var assetType = parts[3];

        // Remove from selectedAssets
        delete selectedAssets[page][assetType];

        // Update budget display
        updateAssetBudgetAfterDelete(page);
    } else {
        // Unit icon: icon-{page}-{unitType}-{index}
        var unitType = parts[2];

        // Decrease quantity
        if (quantities[page][unitType] > 0) {
            quantities[page][unitType]--;

            if (quantities[page][unitType] === 0) {
                delete quantities[page][unitType];
            }

            // Update the input field back in Section 2
            var inputId = 'qty-' + page + '-' + unitType;
            var input = document.getElementById(inputId);
            if (input) {
                input.value = quantities[page][unitType] || 0;
            }
        }
    }

    // Remove the icon from canvas
    iconElement.remove();

    // Update density
    updateDensityDisplay(page);
}

function updateAssetBudgetAfterDelete(page) {
    // Calculate total asset cost
    var totalAssetCost = 0;
    for (var assetType in selectedAssets[page]) {
        if (selectedAssets[page][assetType]) {
            totalAssetCost += assetPrices[assetType];
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

    // Update remaining budget on Section 4 if we go back
    var budgetElement = document.getElementById('budget-s4-' + page);
    if (budgetElement) {
        budgetElement.textContent = '$' + remaining.toLocaleString();
    }
}

function goBackToAssets(page) {
    // Navigate back to Section 4 (Assets)
    document.getElementById('layout' + page.charAt(0).toUpperCase() + page.slice(1)).classList.add('hidden');
    document.getElementById('section4' + page.charAt(0).toUpperCase() + page.slice(1)).classList.remove('hidden');
    currentPage = page + '-section4';
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateBreadcrumb();
}

// Selection and Transform functions
function toggleSelectMode(page) {
    selectMode[page] = !selectMode[page];
    var selectBtn = document.getElementById('select-btn-' + page);
    var transformControls = document.getElementById('transform-controls-' + page);

    if (selectMode[page]) {
        selectBtn.classList.add('active');
        transformControls.classList.add('active');

        // Disable trash mode if active
        if (trashMode[page]) {
            toggleTrashMode(page);
        }
    } else {
        selectBtn.classList.remove('active');
        transformControls.classList.remove('active');
        clearSelection(page);
    }
}

function toggleIconSelection(page, iconElement) {
    if (!selectMode[page]) return;

    var iconId = iconElement.id;
    var index = selectedIcons[page].indexOf(iconId);

    if (index > -1) {
        // Deselect
        selectedIcons[page].splice(index, 1);
        iconElement.classList.remove('selected');
    } else {
        // Select
        selectedIcons[page].push(iconId);
        iconElement.classList.add('selected');
    }
}

function clearSelection(page) {
    selectedIcons[page].forEach(function(iconId) {
        var icon = document.getElementById(iconId);
        if (icon) {
            icon.classList.remove('selected');
        }
    });
    selectedIcons[page] = [];
}

function getIconTransform(iconId) {
    if (!iconTransforms[iconId]) {
        iconTransforms[iconId] = {
            rotation: 0,
            flipH: false,
            flipV: false
        };
    }
    return iconTransforms[iconId];
}

function applyTransform(icon) {
    var transform = getIconTransform(icon.id);
    var scaleX = transform.flipH ? -1 : 1;
    var scaleY = transform.flipV ? -1 : 1;

    icon.style.transform = 'rotate(' + transform.rotation + 'deg) scaleX(' + scaleX + ') scaleY(' + scaleY + ')';
}

function rotateSelected(page, degrees) {
    if (selectedIcons[page].length === 0) {
        alert('Please select icons first by clicking on them in Select Mode');
        return;
    }

    selectedIcons[page].forEach(function(iconId) {
        var icon = document.getElementById(iconId);
        if (icon) {
            var transform = getIconTransform(iconId);
            transform.rotation = (transform.rotation + degrees) % 360;
            applyTransform(icon);
        }
    });
}

function flipSelected(page, direction) {
    if (selectedIcons[page].length === 0) {
        alert('Please select icons first by clicking on them in Select Mode');
        return;
    }

    selectedIcons[page].forEach(function(iconId) {
        var icon = document.getElementById(iconId);
        if (icon) {
            var transform = getIconTransform(iconId);
            if (direction === 'horizontal') {
                transform.flipH = !transform.flipH;
            } else {
                transform.flipV = !transform.flipV;
            }
            applyTransform(icon);
        }
    });
}

function toggleGrid(page) {
    gridEnabled[page] = !gridEnabled[page];
    var canvas = document.getElementById('layout-canvas-' + page);
    var gridBtn = document.getElementById('grid-btn-' + page);

    if (gridEnabled[page]) {
        canvas.classList.remove('grid-off');
        gridBtn.classList.remove('active');
    } else {
        canvas.classList.add('grid-off');
        gridBtn.classList.add('active');
    }
}

// Zoom functions
function setupZoom(page) {
    var canvas = document.getElementById('layout-canvas-' + page);

    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();

        if (e.deltaY < 0) {
            // Scroll up - zoom in
            zoomIn(page);
        } else {
            // Scroll down - zoom out
            zoomOut(page);
        }
    });
}

function applyZoom(page) {
    var viewport = document.getElementById('layout-viewport-' + page);
    var zoomLevelDisplay = document.getElementById('zoom-level-' + page);

    viewport.style.transform = 'scale(' + zoomLevel[page] + ')';
    zoomLevelDisplay.textContent = Math.round(zoomLevel[page] * 100) + '%';
}

function zoomIn(page) {
    if (zoomLevel[page] < 3) { // Max 300%
        zoomLevel[page] += 0.1;
        applyZoom(page);
    }
}

function zoomOut(page) {
    if (zoomLevel[page] > 0.2) { // Min 20%
        zoomLevel[page] -= 0.1;
        applyZoom(page);
    }
}

function resetZoom(page) {
    zoomLevel[page] = 1;
    applyZoom(page);
}

// Pan/drag canvas functions
function enableCanvasPan(page) {
    var canvas = document.getElementById('layout-canvas-' + page);
    var isPanning = false;
    var startX = 0;
    var startY = 0;
    var scrollLeft = 0;
    var scrollTop = 0;

    canvas.addEventListener('mousedown', function(e) {
        // Only pan if clicking on the canvas itself (not on an icon)
        if (!e.target.classList.contains('layout-icon') && !e.target.closest('.layout-icon')) {
            isPanning = true;
            canvas.style.cursor = 'grabbing';
            startX = e.pageX - canvas.offsetLeft;
            startY = e.pageY - canvas.offsetTop;
            scrollLeft = canvas.scrollLeft;
            scrollTop = canvas.scrollTop;
            e.preventDefault();
        }
    });

    canvas.addEventListener('mouseleave', function() {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = 'grab';
        }
    });

    canvas.addEventListener('mouseup', function() {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = 'grab';
        }
    });

    canvas.addEventListener('mousemove', function(e) {
        if (!isPanning) return;
        e.preventDefault();
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        var walkX = (x - startX) * 2; // Multiply for faster panning
        var walkY = (y - startY) * 2;
        canvas.scrollLeft = scrollLeft - walkX;
        canvas.scrollTop = scrollTop - walkY;
    });

    // Set initial cursor
    canvas.style.cursor = 'grab';
}

// Image modal functions
function openImageModal(imageSrc) {
    var modal = document.getElementById('imageModal');
    var modalImage = document.getElementById('modalImage');

    modalImage.src = imageSrc;
    modal.classList.add('active');

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    var modal = document.getElementById('imageModal');
    modal.classList.remove('active');

    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Add click listeners to all unit and asset images when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Use event delegation for dynamically added images
    document.body.addEventListener('click', function(e) {
        // Check if clicked element is inside a unit-compact-image or asset-compact-image
        var imageContainer = e.target.closest('.unit-compact-image, .asset-compact-image');

        if (imageContainer) {
            // Find the img element inside
            var img = imageContainer.querySelector('img');
            if (img && img.src) {
                openImageModal(img.src);
                e.stopPropagation(); // Prevent other click handlers
            }
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
});
