async function main() {
  const recentS1Filings = await getRecentS1Filings(); // Fetch recent S-1 filings
  if (recentS1Filings) {
    displayRecentFilingsTable(recentS1Filings); // Display in a table
  }
}

async function getRecentS1Filings() {
  const url = "https://data.sec.gov/submissions/latest/index.json"; // URL for recent filings

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "to.tonybaby@gmail.com", // Required by SEC
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Recent filings data:", data);

    // Filter for S-1 filings
    const s1Filings = [];
    for (let i = 0; i < data.form.length; i++) {
      if (data.form[i] === "S-1" || data.form[i] === "S-1/A") {
        s1Filings.push({
          cik: data.cik[i].toString().padStart(10, '0'), // Ensure 10-digit CIK
          form: data.form[i],
          accessionNumber: data.accessionNumber[i],
          fileNumber: data.fileNumber[i],
          filingDate: data.filingDate[i],
        });
      }
    }

    // Sort by filing date (most recent first)
    s1Filings.sort((a, b) => new Date(b.filingDate) - new Date(a.filingDate));

    // Take the top 10
    const top10Filings = s1Filings.slice(0, 10);
    return top10Filings;

  } catch (error) {
    console.error("Could not fetch recent S-1 filings:", error);
    return null;
  }
}

function displayRecentFilingsTable(filings) {
  // Get the table body element
  const tableBody = document.getElementById("filings-table").getElementsByTagName('tbody')[0];
  if (!tableBody) {
    console.error("Table body not found in the HTML.");
    return;
  }

  // Clear existing table rows
  tableBody.innerHTML = "";

  if (!filings || filings.length === 0) {
    const row = tableBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 3; // Span all columns
    cell.textContent = "No S-1 filings found";
    return; // Exit the function
  }

  filings.forEach((filing) => {
    const row = tableBody.insertRow();

    // CIK cell
    const cikCell = row.insertCell();
    cikCell.textContent = filing.cik;

    // Form cell
    const formCell = row.insertCell();
    formCell.textContent = filing.form;

    // Filing Link cell
    const filingCell = row.insertCell();
    const filingLink = document.createElement("a");

    // Construct the filing URL (HTML version)
    const filingUrl = `https://www.sec.gov/Archives/edgar/data/${filing.cik}/${filing.accessionNumber.replace(/\-/g, "")}/${filing.fileNumber}.htm`;

    filingLink.href = filingUrl;
    filingLink.textContent = `${filing.form} - ${filing.filingDate}`;
    filingLink.target = "_blank"; // Open in new tab
    filingCell.appendChild(filingLink);
  });
}

document.addEventListener("DOMContentLoaded", main);