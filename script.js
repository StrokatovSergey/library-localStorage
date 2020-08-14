var ServiceWorkers;
(function (ServiceWorkers) {
    ServiceWorkers.submitMood = 'create';
    ServiceWorkers.shalowBook = {
        author: '',
        bookName: '0',
        pages: '0',
        year: '0'
    };
    function setShalowBook(book) {
        ServiceWorkers.shalowBook = book;
    }
    ServiceWorkers.setShalowBook = setShalowBook;
    function setMoode(mode) {
        ServiceWorkers.submitMood = mode;
    }
    ServiceWorkers.setMoode = setMoode;
})(ServiceWorkers || (ServiceWorkers = {}));
//установить новую библиотеку
var setBooks = function (books) {
    localStorage.setItem('books', JSON.stringify(books));
};
//получить текущую библиотеку
var getBooks = function () { return JSON.parse(localStorage.getItem('books')); };
//первичная инициализация библиотеки в localStorage
var firstInitializeBooks = function () {
    if (!getBooks()) {
        changeTitle('There are not books, sir');
        isListVisible(false);
        setBooks([]);
    }
};
//создать книгу
var createBookItem = function (item, index) {
    var li = document.createElement("LI");
    var labelContainer = document.createElement('DIV');
    var author = document.createElement('SPAN');
    var bookName = document.createElement('SPAN');
    var pages = document.createElement('SPAN');
    var year = document.createElement('SPAN');
    var btnContainer = document.createElement('DIV');
    var btnDelete = document.createElement('BUTTON');
    var btnEdit = document.createElement('BUTTON');
    labelContainer.className = "books__item-label-container";
    li.className = "books__item-body";
    author.className = "books__item-label";
    bookName.className = "books__item-label";
    pages.className = "books__item-label";
    year.className = "books__item-label";
    btnContainer.className = "books__item-btn-container";
    btnDelete.className = "books__btn books__item-btn-delete";
    btnEdit.className = "books__btn books__item-btn-edit";
    author.textContent = item.author;
    bookName.textContent = item.bookName;
    pages.textContent = item.pages;
    year.textContent = item.year;
    btnDelete.textContent = 'delete';
    btnEdit.textContent = 'edit';
    btnEdit.addEventListener('click', function () { return editBook(index); });
    btnDelete.addEventListener('click', function () { return deleteBook(index); });
    labelContainer.append(author, bookName, pages, year, btnContainer);
    btnContainer.append(btnEdit, btnDelete);
    li.append(labelContainer, btnContainer);
    return li;
};
//сделать blur на все книги, во время редактирвоания
var addBlur = function () {
    var liArr = document.querySelectorAll('.books__list > li');
    liArr.forEach(function (item) {
        item.classList.add('books__item-body--blur');
    });
};
//удалить книгу
var deleteBook = function (index) {
    var books = getBooks();
    books.splice(index, 1);
    setBooks(books);
    rendeListBooks();
};
//редактировать книгу
var editBook = function (index) {
    var books = getBooks();
    var EditingBook = books[index];
    ServiceWorkers.setShalowBook(EditingBook);
    ServiceWorkers.setMoode('edit');
    var author = document.querySelector('.books__form input[name="author"]');
    var bookName = document.querySelector('.books__form input[name="bookName"]');
    var pages = document.querySelector('.books__form input[name="pages"]');
    var year = document.querySelector('.books__form input[name="year"]');
    author.value = EditingBook.author;
    bookName.value = EditingBook.bookName;
    pages.value = EditingBook.pages;
    year.value = EditingBook.year;
    document.querySelector('.books__btn-add').classList.add("books__btn--disabled-btn");
    document.querySelector('.books__btn-edit').classList.remove("books__btn--disabled-btn");
    addBlur();
};
//рендер списка книг
var rendeListBooks = function () {
    var ul = document.querySelector('.books__list');
    ul.innerHTML = '';
    var list = getBooks();
    list.forEach(function (item, index) {
        ul.append(createBookItem(item, index));
    });
};
//получение данных с формы при сабмите
var getValuesFromForm = function (e) {
    e.preventDefault();
    var answer = {
        author: '',
        bookName: '',
        pages: '',
        year: ''
    };
    var form = document.querySelector('.books .books__form');
    form.querySelectorAll("input").forEach(function (input) {
        answer[input.name] = input.value || "";
    });
    console.log(answer);
    form.reset();
    return answer;
};
//обработка формы при создании книги
var submitFormCreatingBook = function (e) {
    var answer = getValuesFromForm(e);
    var books = getBooks();
    books.push(answer);
    setBooks(books);
    rendeListBooks();
};
//обработка формы при редактировании книги
var submitFormEditingBook = function (e) {
    ServiceWorkers.setMoode('create');
    document.querySelector('.books__btn-add').classList.remove("books__btn--disabled-btn");
    document.querySelector('.books__btn-edit').classList.add("books__btn--disabled-btn");
    var answer = getValuesFromForm(e);
    var books = getBooks();
    // @ts-ignore
    var index = books.findIndex(function (item) { return JSON.stringify(item) === JSON.stringify(ServiceWorkers.shalowBook); });
    books[index] = answer;
    setBooks(books);
    rendeListBooks();
};
//обработка формы в зависимости от настройки
var generalSubmitting = function (e) {
    if (ServiceWorkers.submitMood === 'create') {
        submitFormCreatingBook(e);
    }
    else {
        submitFormEditingBook(e);
    }
};
//поменять главный заголовок
var changeTitle = function (text) {
    document.querySelector('.books__title').textContent = text;
};
//показать-скрыть список
var isListVisible = function (arg) {
    var ul = document.querySelector('.books__list');
    if (arg === true) {
        ul.classList.remove('hidden');
    }
    else {
        ul.classList.add('hidden');
    }
};
//наблюдатель за элементами списка
var myObserverForChild = function () {
    if (getBooks().length !== 0) {
        isListVisible(true);
        changeTitle('Yours books, sir');
    }
    else {
        changeTitle('There are not books, sir');
        isListVisible(false);
    }
};
// активировать наблюдатель за элементами списка
var activateMyObserverForChild = function () {
    var target = document.querySelector('.books__list');
    var observer = new MutationObserver(function (mutations) {
        myObserverForChild();
    });
    observer.observe(target, { childList: true });
};
//пеервичный жизненный цикл при загрузке страницы
var firstLifecycle = function () {
    firstInitializeBooks();
    activateMyObserverForChild();
    myObserverForChild();
    rendeListBooks();
    document.querySelector(".books__form").addEventListener('submit', generalSubmitting);
};
document.addEventListener("DOMContentLoaded", firstLifecycle);
