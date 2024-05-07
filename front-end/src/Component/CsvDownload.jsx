
// Function to convert an array of objects to CSV string. 
// Use this function in table.jsx
export function convertArrayOfObjectsToCSV(array) {
    // Retrieve the header
    const header = Object.keys(array[0]).join(',');
  
    // Map the rows
    const csvRows = array.map(row =>
      Object.values(row)
        .map(field =>
          `"${String(field).replace(/"/g, '""')}"` // Escape double quotes
        ).join(',')
    );
  
    // Combine header and rows
    return [header].concat(csvRows).join('\n');
  }
  

  
// Function to trigger the download
export function downloadCSV(csvString, filename) {
// Create a Blob with the CSV string
const blob = new Blob([csvString], { type: 'text/csv' });

// Create a link to download it
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
}
