interface Book {
    author: string,
    bookName: string,
    pages:string,
    year:string
}


namespace ServiceWorkers {
   export let submitMood:string = 'create';
   export let shalowBook:Book = {
    author: '',
    bookName: '0',
    pages: '0',
    year: '0'
   }
   export function setShalowBook(book:Book):void { //установить книгу, которая редактируется
    shalowBook = book
   }
   export function setMoode(mode:string):void { //установить способ обработки формы
    ServiceWorkers.submitMood = mode
   }
}

//установить новую библиотеку
const setBooks = (books:Array<Book>):void => {
    localStorage.setItem('books', JSON.stringify(books))
}

//получить текущую библиотеку
const getBooks = ():Array<Book> => JSON.parse(localStorage.getItem('books'))


//первичная инициализация библиотеки в localStorage
const firstInitializeBooks = () => {
    if (!getBooks()) {
        changeTitle('There are not books, sir')
        isListVisible(false)
        setBooks([])
    } 
}


//создать книгу
const createBookItem = (item:Book, index:any):HTMLElement => {
    const li:HTMLElement = document.createElement("LI");

    const labelContainer:HTMLElement = document.createElement('DIV');
    const author:HTMLSpanElement = document.createElement('SPAN');
    const bookName:HTMLSpanElement = document.createElement('SPAN');
    const pages:HTMLSpanElement = document.createElement('SPAN');
    const year:HTMLSpanElement = document.createElement('SPAN');


    const btnContainer:HTMLElement = document.createElement('DIV');
    const btnDelete:HTMLElement = document.createElement('BUTTON');
    const btnEdit:HTMLElement = document.createElement('BUTTON');

    labelContainer.className = "books__item-label-container"
    li.className = "books__item-body";
    author.className = "books__item-label";
    bookName.className = "books__item-label";
    pages.className = "books__item-label";
    year.className = "books__item-label";

    btnContainer.className = "books__item-btn-container"
    btnDelete.className = "books__btn books__item-btn-delete";
    btnEdit.className = "books__btn books__item-btn-edit";

    author.textContent = item.author;
    bookName.textContent = item.bookName;
    pages.textContent = item.pages;
    year.textContent = item.year;

    btnDelete.textContent = 'delete';
    btnEdit.textContent = 'edit';

    btnEdit.addEventListener('click', () => editBook(index))
    btnDelete.addEventListener('click', () => deleteBook(index))

    labelContainer.append(author, bookName, pages, year, btnContainer)
    btnContainer.append(btnEdit, btnDelete)

    li.append(labelContainer, btnContainer);

    return li
}

//сделать blur на все книги, во время редактирвоания
const addBlur = (): void => {
    const liArr = document.querySelectorAll('.books__list > li')
    liArr.forEach((item) => {
            item.classList.add('books__item-body--blur')
    })
}

//удалить книгу
const deleteBook = (index:number): void => {
    const books:Array<Book> = getBooks()
    books.splice(index, 1)
    setBooks(books)
    rendeListBooks()
}

//редактировать книгу
const editBook = (index:number) => {
    const books:Book[] = getBooks();
    const EditingBook:Book = books[index];

    ServiceWorkers.setShalowBook(EditingBook);
    ServiceWorkers.setMoode('edit')

    let author: HTMLInputElement = document.querySelector('.books__form input[name="author"]');
    let bookName: HTMLInputElement = document.querySelector('.books__form input[name="bookName"]');
    let pages: HTMLInputElement = document.querySelector('.books__form input[name="pages"]');
    let year: HTMLInputElement = document.querySelector('.books__form input[name="year"]');

    author.value = EditingBook.author;
    bookName.value = EditingBook.bookName;
    pages.value = EditingBook.pages;
    year.value = EditingBook.year;

    document.querySelector('.books__btn-add').classList.add("books__btn--disabled-btn");
    document.querySelector('.books__btn-edit').classList.remove("books__btn--disabled-btn");

    addBlur()
}

//рендер списка книг
const rendeListBooks = (): void => {
    const ul = document.querySelector('.books__list');
    ul.innerHTML = '';
    const list: Book[] = getBooks();
    list.forEach((item, index) => {
        ul.append(createBookItem(item, index));
    })
}

//получение данных с формы при сабмите
const getValuesFromForm = (e:Event) => {
    
    e.preventDefault();
    let answer:Book | any  = {
        author: '',
        bookName: '',
        pages: '',
        year: ''
       };
    const form: HTMLFormElement = document.querySelector('.books .books__form');
    form.querySelectorAll("input").forEach(input => {
        answer[input.name] = input.value || ""
    });
    console.log(answer);
    form.reset();
    return answer
}


//обработка формы при создании книги
const submitFormCreatingBook = (e:Event): void => {

    let answer = getValuesFromForm(e)
    let books = getBooks();

    books.push(answer);
    setBooks(books)
    rendeListBooks();
}

//обработка формы при редактировании книги
const submitFormEditingBook = (e:Event): void => {
    ServiceWorkers.setMoode('create');

    document.querySelector('.books__btn-add').classList.remove("books__btn--disabled-btn");
    document.querySelector('.books__btn-edit').classList.add("books__btn--disabled-btn");

    let answer = getValuesFromForm(e)
    let books = getBooks();
    // @ts-ignore
    const index = books.findIndex((item:Book) => JSON.stringify(item) === JSON.stringify(ServiceWorkers.shalowBook)); 
    books[index] = answer;

    setBooks(books)
    rendeListBooks();
}

//обработка формы в зависимости от настройки
const generalSubmitting = (e:Event) => {
    if (ServiceWorkers.submitMood === 'create') {
        submitFormCreatingBook(e);
    } else {
        submitFormEditingBook(e);
    }
}

//поменять главный заголовок
const changeTitle = (text:string) => {
    document.querySelector('.books__title').textContent = text;
}

//показать-скрыть список
const isListVisible = (arg:boolean):void => {
    const ul:HTMLElement = document.querySelector('.books__list');
    if (arg === true) {
        ul.classList.remove('hidden');
    } else {
        ul.classList.add('hidden')
    }
}

//наблюдатель за элементами списка
const myObserverForChild = (): void => {
    if (getBooks().length !== 0) {
        isListVisible(true)
        changeTitle('Yours books, sir')
    } else {
        changeTitle('There are not books, sir')
        isListVisible(false)
    }   
}


// активировать наблюдатель за элементами списка
const activateMyObserverForChild = () => {
    let target:HTMLElement = document.querySelector('.books__list');
    let observer = new MutationObserver(mutations => {
        myObserverForChild()
    })
    observer.observe(target, { childList:true })
}


//пеервичный жизненный цикл при загрузке страницы
const firstLifecycle = () => {
    firstInitializeBooks()
    activateMyObserverForChild()
    myObserverForChild()
    rendeListBooks();
    document.querySelector(".books__form").addEventListener('submit', generalSubmitting);
}


document.addEventListener("DOMContentLoaded", firstLifecycle);




