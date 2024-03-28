document.addEventListener("DOMContentLoaded", function() {
    const submitForm = document.getElementById("submitBuku");
    submitForm.addEventListener("click", function(event) {
        event.preventDefault();
        tambahBuku();
        hapusForm();
    });

    const searchForm = document.getElementById("searchForm");
    searchForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
        cariBukuDenganJudul(searchInput);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
        refreshDataFromList();
    }
});

function cariBukuDenganJudul(title) {
    const hasilPencarian = list.filter(buku => buku.title.toLowerCase().includes(title));
    tampilkanHasilPencarian(hasilPencarian);
}

function tampilkanHasilPencarian(hasilPencarian) {
    const searchResults = document.getElementById("searchResults");
    const searchList = document.getElementById("searchList");
    searchList.innerHTML = ""; 

    if (hasilPencarian.length === 0) {
        searchList.innerHTML = "<p>Pencarian Tidak.</p>";
    } else {
        hasilPencarian.forEach(buku => {
            const bukuElement = buatListBaca(buku.title, buku.author, buku.year, buku.selesai);
            searchList.appendChild(bukuElement);
        });
    }

    searchResults.style.display = "block"; 
}

const ID_LIST_BELUM = "listBelum";
const ID_LIST_SUDAH = "listSudah";
const ID_MIR = "idMir";

function tambahBuku() {
    const listBelumBaca = document.getElementById(ID_LIST_BELUM);
    const listSudahBaca = document.getElementById(ID_LIST_SUDAH);
    const checkType = document.getElementById("inputBukuSelesai");

    const title = document.getElementById("inputTitle").value;
    const author = document.getElementById("inputAuthor").value;
    const year = parseInt(document.getElementById("inputYear").value); 
    if (title === '' || author === '' || isNaN(year)) {
        alert("Harap lengkapi semua informasi buku!");
        return;
    }

    if (!checkType.checked) {
        const listBaca = buatListBaca(title, author, year, false);
        const objekBuku = buatObjekBuku(title, author, year, false);
        listBaca[ID_MIR] = objekBuku.id;
        list.push(objekBuku);
        listBelumBaca.append(listBaca);
    } else {
        const listBaca = buatListBaca(title, author, year, true);
        const objekBuku = buatObjekBuku(title, author, year, true);
        listBaca[ID_MIR] = objekBuku.id;
        list.push(objekBuku);
        listSudahBaca.append(listBaca);
    }
    updateDataToStorage();
}

function hapusForm() {
    document.getElementById("inputTitle").value = "";
    document.getElementById("inputAuthor").value = "";
    document.getElementById("inputYear").value = "";
    document.getElementById("inputBukuSelesai").checked = false;
}

function buatTombol(buttonTypeClass, eventListener) {
    const tombol = document.createElement("button");
    tombol.classList.add(buttonTypeClass);
    tombol.addEventListener("click", function(event) {
        eventListener(event);
    });
    return tombol; 
}

function tambahBukuSelesai(elemenBuku) {
    const titleBuku = elemenBuku.querySelector(".title_buku").innerText;
    const authorBuku = elemenBuku.querySelector(".author_buku").innerText;
    const yearBuku = elemenBuku.querySelector(".year_buku").innerText;

    const bukuElemir = buatListBaca(titleBuku, authorBuku, yearBuku, true);
    const listSelesai = document.getElementById(ID_LIST_SUDAH);
    const book = cariBuku(elemenBuku[ID_MIR]);
    book.selesai = true;
    bukuElemir[ID_MIR] = book.id;
    listSelesai.append(bukuElemir);
    elemenBuku.remove();
    updateDataToStorage();
}

function buatTombolCek() {
    return buatTombol("checklist", function(event) {
        const parent = event.target.parentElement;
        tambahBukuSelesai(parent.parentElement);
    });
}

function hapusBukuSelesai(elemenBuku) {
    const posisiBuku = cariIndeksBuku(elemenBuku[ID_MIR]);
    list.splice(posisiBuku, 1);
    elemenBuku.remove();
    updateDataToStorage();
}

function buatTombolSampah() {
    return buatTombol("trash", function(event) {
        const parent = event.target.parentElement;
        hapusBukuSelesai(parent.parentElement);
    });
}

function buatTombolUndo() {
    return buatTombol("undo", function(event) {
        const parent = event.target.parentElement;
        undoBukuSelesai(parent.parentElement);
    });
}

function buatTombolEdit() {
    return buatTombol("edit", function(event) {
        const parent = event.target.parentElement;
        editInfoBuku(parent.parentElement);
    });
}

function undoBukuSelesai(elemenBuku) {
    const titleBuku = elemenBuku.querySelector(".title_buku").innerText;
    const authorBuku = elemenBuku.querySelector(".author_buku").innerText;
    const yearBuku = elemenBuku.querySelector(".year_buku").innerText;

    const bukuElemir = buatListBaca(titleBuku, authorBuku, yearBuku,  false);
    const listBelumBaca = document.getElementById(ID_LIST_BELUM);

    const book = cariBuku(elemenBuku[ID_MIR]);
    book.selesai = false;
    bukuElemir[ID_MIR] = book.id;
    listBelumBaca.append(bukuElemir);
    elemenBuku.remove();

    updateDataToStorage();
}

function editInfoBuku(elemenBuku) {
    document.getElementById("submitBuku").style.display = "none";
    const editButton = document.getElementById("editBuku");
    editButton.style.display = "block";
    document.getElementById("inputTitle").value = elemenBuku.querySelector(".title_buku").innerText;
    document.getElementById("inputAuthor").value = elemenBuku.querySelector(".author_buku").innerText;
    document.getElementById("inputYear").value = elemenBuku.querySelector(".year_buku").innerText;

    editButton.addEventListener("click", function(event) {
        event.preventDefault();
        tambahBukuEdit(elemenBuku);
    });
}

function tambahBukuEdit(elemenBuku) {
    elemenBuku.remove();
    hapusBukuSelesai(elemenBuku);
    const listBelumBaca = document.getElementById(ID_LIST_BELUM);
    const listSudahBaca = document.getElementById(ID_LIST_SUDAH);
    const checkType = document.getElementById("inputBukuSelesai");

    const title = document.getElementById("inputTitle").value;
    const author = document.getElementById("inputAuthor").value;
    const year = document.getElementById("inputYear").value;

    if (!checkType.checked) {
        const listBaca = buatListBaca(title, author, year,false);
        const objekBuku = buatObjekBuku(title, author, year, false);
        listBaca[ID_MIR] = objekBuku.id;
        list.push(objekBuku);
        listBelumBaca.append(listBaca);
    } else {
        const listBaca = buatListBaca(title, author, year, true);
        const objekBuku = buatObjekBuku(title, author, year, true);
        listBaca[ID_MIR] = objekBuku.id;
        list.push(objekBuku);
        listSudahBaca.append(listBaca);
    }
    updateDataToStorage();
    hapusForm();
    tombolKembali();
}

function tombolKembali() {
    document.getElementById("submitBuku").style.display = "block";
    document.getElementById("editBuku").style.display = "none";
}

const STORAGE_KEY = "READING_LIST";

let list = [];

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false
    }
    return true;
}

function saveData() {
    const parsed = JSON.stringify(list);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event("ondatasaved"));
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null)
        list = data;
    document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
    if (isStorageExist())
        saveData();
}

function buatObjekBuku(title, author, year, selesai) {
    return {
        id: +new Date(),
        title,
        author,
        year: parseInt(year),
        selesai
    };
}

function cariBuku(idMir) {
    for (book of list) {
        if (book.id === idMir)
            return book;
    }
    return null;
}

function cariIndeksBuku(idMir) {
    let index = 0
    for (book of list) {
        if (book.id === idMir)
            return index;

        index++;
    }

    return -1;
}

function buatListBaca(titleB, authorB, yearB, selesai) {
    const titleBuku = document.createElement("h3");
    titleBuku.innerText = "Title : ";
    const title = document.createElement("span");
    title.classList.add("title_buku");
    title.innerText = titleB;
    titleBuku.append(title);

    const authorBuku = document.createElement("p");
    authorBuku.innerText = "Author : ";
    const author = document.createElement("span");
    author.classList.add("author_buku");
    author.innerText = authorB;
    authorBuku.append(author);

    const yearBuku = document.createElement("p");
    yearBuku.innerText = "Year : ";
    const year = document.createElement("span");
    year.classList.add("year_buku");
    year.innerText = yearB;
    yearBuku.append(year);


    const yantoBuku = document.createElement("div");
    yantoBuku.classList.add("yanto");
    yantoBuku.append(titleBuku, authorBuku, yearBuku);

    const haryantoBuku = document.createElement("div");
    haryantoBuku.classList.add("action");

    const container = document.createElement("article");
    container.classList.add("book_item");
    container.append(yantoBuku, haryantoBuku);

    if (selesai) {
        haryantoBuku.append(
            buatTombolEdit(),
            buatTombolUndo(),
            buatTombolSampah()
        );
    } else {
        haryantoBuku.append(buatTombolEdit(), buatTombolCek(), buatTombolSampah());
    }

    return container;
}

function refreshDataFromList() {
    const listBelumSelesai = document.getElementById(ID_LIST_BELUM);
    let listSelesai = document.getElementById(ID_LIST_SUDAH);
    for (book of list) {
        const bukuElemir = buatListBaca(book.title, book.author, book.year, book.selesai);
        bukuElemir[ID_MIR] = book.id;
        if (book.selesai) {
            listSelesai.append(bukuElemir);
        } else {
            listBelumSelesai.append(bukuElemir);
        }
    }
}

let buttonTypeClass = "";

if (matchMedia) {
    const mq = window.matchMedia("(max-width: 1200px)");
    mq.addListener(WidthChange);
    WidthChange(mq);
}

function WidthChange(mq) {
    if (mq.matches) {
        buttonTypeClass = "checklist";
    } else {
        buttonTypeClass = "edit";
    }
}
