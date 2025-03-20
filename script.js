document.getElementById("processBtn").addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput").files[0];

    if (!fileInput) {
        alert("Please upload a CSV file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result;
        processCSV(csvData);
    };
    reader.readAsText(fileInput);
});

function processCSV(csv) {
    let rows = csv.split("\n").map(row => row.split(","));
    let header = rows[0]; // First row as header
    let data = rows.slice(1); // Remaining rows

    let duplicates = findDuplicates(data);
    displayData(duplicates);
}

function findDuplicates(data) {
    let seen = new Map();
    let duplicates = [];

    data.forEach(row => {
        let key = row[0] + row[1] + row[2]; // Example: Transaction ID, Amount, Date
        if (seen.has(key)) {
            duplicates.push(row);
        } else {
            seen.set(key, true);
        }
    });

    return duplicates;
}

function displayData(duplicates) {
    let tableBody = document.querySelector("#outputTable tbody");
    tableBody.innerHTML = "";

    duplicates.forEach(row => {
        let tr = document.createElement("tr");
        row.forEach(cell => {
            let td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    if (duplicates.length === 0) {
        alert("No duplicate payments found.");
    }
}
