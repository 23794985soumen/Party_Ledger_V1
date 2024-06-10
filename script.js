document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('ledger-form');
    const tableBody = document.getElementById('ledger-table').getElementsByTagName('tbody')[0];
    const partyFilter = document.getElementById('party-filter');
    const printBtn = document.getElementById('print-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');

    let balance = 0;
    let entries = [];

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const partyName = document.getElementById('party_name').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const debit = parseFloat(document.getElementById('debit').value) || 0;
        const credit = parseFloat(document.getElementById('credit').value) || 0;

        if (!partyName || !date || !description || (debit === 0 && credit === 0)) {
            alert('Please fill out all required fields and either Debit or Credit.');
            return;
        }

        balance += credit - debit;
        const entry = {
            date,
            partyName,
            transactionNumber: entries.length + 1,
            description,
            debit: debit.toFixed(2),
            credit: credit.toFixed(2),
            balance: balance.toFixed(2)
        };

        entries.push(entry);
        updateTable();
        form.reset();
    });

    partyFilter.addEventListener('input', updateTable);

    function updateTable() {
        const searchValue = partyFilter.value.toLowerCase();
        tableBody.innerHTML = '';
        let runningBalance = 0;

        entries.forEach((entry, index) => {
            if (searchValue === '' || entry.partyName.toLowerCase().includes(searchValue)) {
                runningBalance += parseFloat(entry.credit) - parseFloat(entry.debit);
                const newRow = tableBody.insertRow();

                newRow.innerHTML = `
                    <td>${entry.date}</td>
                    <td>${entry.partyName}</td>
                    <td>${entry.transactionNumber}</td>
                    <td>${entry.description}</td>
                    <td>${entry.debit}</td>
                    <td>${entry.credit}</td>
                    <td>${runningBalance.toFixed(2)}</td>
                    <td>
                        <button class="edit-btn" data-index="${index}">Edit</button>
                        <button class="delete-btn" data-index="${index}">Delete</button>
                    </td>
                `;
            }
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', editEntry);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteEntry);
        });
    }

    function editEntry(event) {
        const index = event.target.dataset.index;
        const entry = entries[index];
        
        document.getElementById('party_name').value = entry.partyName;
        document.getElementById('date').value = entry.date;
        document.getElementById('description').value = entry.description;
        document.getElementById('debit').value = entry.debit;
        document.getElementById('credit').value = entry.credit;

        entries.splice(index, 1);
        updateTable();
    }

    function deleteEntry(event) {
        const index = event.target.dataset.index;
        entries.splice(index, 1);
        updateTable();
    }

    printBtn.addEventListener('click', () => {
        const printContents = document.getElementById('ledger-table').outerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = `<html><head><title>Print</title></head><body>${printContents}</body></html>`;
        window.print();
        document.body.innerHTML = originalContents;
    });

    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.autoTable({ html: '#ledger-table' });
        doc.save('ledger.pdf');
    });

    exportExcelBtn.addEventListener('click', () => {
        const table = document.getElementById('ledger-table');
        const wb = XLSX.utils.table_to_book(table);
        XLSX.writeFile(wb, 'ledger.xlsx');
    });
});
