let db;
const request = indexedDB.open('budget-tracker', 1);

request.onUpgradeNeeded = function(event) {
    const db = event.target.result;
    db.creatObjectStore('budget_transaction', { autoIncrement: true });
};

request.onSuccess = function(event) {
    db = event.target.result;

    if (navigator.online) {
        uploadBudgetTransaction();
    }
};

request.onError = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['budget_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('budget_transaction');

    budgetObjectStore.add(record);
};

function uploadBudgetTransaction() {
    const transaction = db.transaction(['budget_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('budget_transaction');

    // gets all records from store as variable
    const getAll = budgetObjectStore.getAll();

    // With succesfull getAll runs the followiung function
    getAll.onSuccess = function(){
        if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
                accept:"application/json, text/plain, */*",
                "Content-Type": 'application/json'
            }
        })
        .then(response => response.json())
        .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            const transaction = db.transaction(['budget_transaction'], 'readwrite');
            const budgetObjectStore = transaction.objectStore('budget_transaction');
            budgetObjectStore.clear();

            alert(' All saved budget transactions were submittted');
        })
        .catch(err => {
            console.log(err);
        });
    }
    };
}

window.addEventListener('online', uploadBudgetTransaction)