let selectedRows = new Set();
let tableData = [];
let sortOrder = {}; 

function loadData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            tableData = data;
            populateTable();
        });
}

function populateTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 
    tableData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><div class="custom-checkbox" onclick="toggleCheckbox(this)"><i class="fa-solid fa-check"></i></div></td>
            <td contenteditable="true">${item.id}</td> 
            <td contenteditable="true">${item.chemicalName}</td>
            <td contenteditable="true">${item.vendor}</td>
            <td contenteditable="true">${item.density}</td>
            <td contenteditable="true">${item.viscosity}</td>
            <td contenteditable="true">${item.packaging}</td>
            <td contenteditable="true">${item.packSize}</td>
            <td contenteditable="true">${item.unit}</td>
            <td contenteditable="true">${item.quantity}</td>
        `;
        tbody.appendChild(row);
    });
}

function toggleCheckbox(element) {
    const row = element.parentNode.parentNode;
    const index = Array.prototype.indexOf.call(row.parentNode.children, row);

    if (element.classList.contains('checked')) {
        element.classList.remove('checked');
        selectedRows.delete(index);
    } else {
        element.classList.add('checked');
        selectedRows.add(index);
    }
    highlightSelectedRows();
}

function toggleCheckboxAll(element) {
    const allCheckboxes = document.querySelectorAll('tbody .custom-checkbox');
    const isChecked = Array.from(allCheckboxes).every(checkbox => checkbox.querySelector('i').classList.contains('checked'));

    if (isChecked) {
        allCheckboxes.forEach(checkbox => {
            checkbox.querySelector('i').classList.remove('checked');
            checkbox.querySelector('i').style.color = 'gray'; 
        });
        selectedRows.clear(); 
        element.querySelector('i').classList.remove('checked');
        element.querySelector('i').style.color = 'gray'; 
    } else {
        allCheckboxes.forEach((checkbox, index) => {
            checkbox.querySelector('i').classList.add('checked');
            checkbox.querySelector('i').style.color = 'blue'; 
            selectedRows.add(index); 
        });
        element.querySelector('i').classList.add('checked');
        element.querySelector('i').style.color = 'blue'; 
    }
    highlightSelectedRows();
}

function highlightSelectedRows() {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        if (selectedRows.has(index)) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
}


function sortTable(n) {
    const field = Object.keys(tableData[0])[n];
    if (!sortOrder[field] || sortOrder[field] === 'desc') {
        tableData.sort((a, b) => (a[field] > b[field] ? 1 : -1));
        sortOrder[field] = 'asc';
    } else {
        tableData.sort((a, b) => (a[field] < b[field] ? 1 : -1));
        sortOrder[field] = 'desc';
    }
    populateTable();
    highlightSelectedRows(); 
}

document.getElementById('addRow').addEventListener('click', () => {
    const newRow = {
        id: tableData.length ? Math.max(...tableData.map(row => row.id)) + 1 : 1,
        chemicalName: 'New Chemical',
        vendor: '',
        density: '',
        viscosity: '',
        packaging: '',
        packSize: '',
        unit: '',
        quantity: ''
    };
    tableData.push(newRow);
    populateTable();
});

document.getElementById('moveUp').addEventListener('click', () => {
    const sortedSelectedRows = Array.from(selectedRows).sort();
    sortedSelectedRows.forEach(index => {
        if (index > 0) {
            [tableData[index], tableData[index - 1]] = [tableData[index - 1], tableData[index]];
            selectedRows.delete(index);
            selectedRows.add(index - 1);
        }
    });
    populateTable();
    highlightSelectedRows();
});

document.getElementById('moveDown').addEventListener('click', () => {
    const sortedSelectedRows = Array.from(selectedRows).sort().reverse();
    sortedSelectedRows.forEach(index => {
        if (index < tableData.length - 1) {
            [tableData[index], tableData[index + 1]] = [tableData[index + 1], tableData[index]];
            selectedRows.delete(index);
            selectedRows.add(index + 1);
        }
    });
    populateTable();
    highlightSelectedRows();
});

document.getElementById('deleteRow').addEventListener('click', () => {
    tableData = tableData.filter((_, index) => !selectedRows.has(index));
    selectedRows.clear();
    populateTable();
});

document.getElementById('refreshData').addEventListener('click', loadData);

document.getElementById('saveToJson').addEventListener('click', () => {
    const updatedData = Array.from(document.querySelectorAll('tbody tr')).map(row => {
        return {
            id: row.cells[1].innerText, 
            chemicalName: row.cells[2].innerText, 
            vendor: row.cells[3].innerText,
            density: row.cells[4].innerText,
            viscosity: row.cells[5].innerText,
            packaging: row.cells[6].innerText,
            packSize: row.cells[7].innerText,
            unit: row.cells[8].innerText,
            quantity: row.cells[9].innerText
        };
    });

    tableData = updatedData;
    const jsonData = JSON.stringify(tableData, null, 2);
    downloadJson(jsonData, 'data.json');
});

function downloadJson(jsonData, filename) {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

window.onload = loadData;
