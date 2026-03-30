let db;

const request = indexedDB.open("TreinoDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    db.createObjectStore("historico", { keyPath: "id", autoIncrement: true });
    db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    carregarHistorico();
    carregarNotas();
};