let csvData = ""; // Store CSV content globally

document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        alert("Please select a CSV file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        csvData = e.target.result; // Store the CSV content
    };
    reader.readAsText(file);
});

document.getElementById("processBtn").addEventListener("click", function () {
    if (!csvData) {
        alert("Please upload a CSV file first.");
        return;
    }

    processCSV(csvData);
});

function processCSV(csv) {
    let rows = csv.split("\n").map(row => row.split(","));
    let header = rows[0]; // First row as header
    let data = rows.slice(1); // Remaining rows

    // Remove rows where Column S (index 18) contains "fake_bank"
    let filteredData = data.filter(row => row[18]?.trim() !== "fake_bank");

    let duplicates = findDuplicates(filteredData);
    displayData(duplicates);
}

function findDuplicates(data) {
    let seen = new Map();
    let duplicates = [];

    data.forEach(row => {
        let key = row[16] + row[13] + row[8]; // Using Q (Merchant Name), N (PAN), I (Amount)

        if (seen.has(key)) {
            let prevRow = seen.get(key);

            // Convert Column O (Date) into timestamp & compare time difference
            let prevTime = new Date(prevRow[14]).getTime();
            let currTime = new Date(row[14]).getTime();
            let timeDiff = Math.abs(currTime - prevTime) / 60000; // Convert milliseconds to minutes

            if (timeDiff < 10) {
                duplicates.push(row);
            }
        } else {
            seen.set(key, row);
        }
    });

    return duplicates;
}

function displayData(duplicates) {
    let tableBody = document.querySelector("#outputTable tbody");
    tableBody.innerHTML = ""; // Clear previous data

    duplicates.forEach(row => {
        let tr = document.createElement("tr");

        let columnsToShow = [1, 4, 6, 8, 13, 14, 16, 18]; // B, E, G, I, N, O, Q, S

        columnsToShow.forEach(index => {
            let td = document.createElement("td");
            td.textContent = row[index] || "N/A"; // Show "N/A" if data is missing
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });

    if (duplicates.length === 0) {
        alert("No duplicate payments found.");
    }
}
