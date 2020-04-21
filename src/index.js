'use strict';
// чекбокс
function toggleCheckbox() {
    const checkbox = document.querySelectorAll('.filter-check_checkbox');

    checkbox.forEach((elem) => {
        elem.addEventListener('change', function () {
            if (this.checked === true) {
                this.nextElementSibling.classList.add('checked');
            } else {
                this.nextElementSibling.classList.remove('checked');
            }
        });
    });
}

//Корзина
function toggleCart() {
    const btnCart = document.getElementById('cart');
    const modalCart = document.querySelector('.cart');
    const closeBtn = document.querySelector('.cart-close');

    btnCart.addEventListener('click', () => {
        modalCart.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', () => {
        modalCart.style.display = 'none';
        document.body.style.overflow = '';
    });
}

// работа с корзиной
function addCart() {
    const cards = document.querySelectorAll('.card');
    const cartWrapper = document.querySelector('.cart-wrapper');
    const cartEmpty = document.getElementById('cart-empty');
    const countGoods = document.querySelector('.counter');


    cards.forEach((elem) =>{
        const btn = elem.querySelector('button');

        btn.addEventListener('click', () => {
            const cardClone = elem.cloneNode(true);
            cartWrapper.appendChild(cardClone);
            showData();

            const removeBtn = cardClone.querySelector('.btn');
            removeBtn.textContent = 'Удалить из корзины';
            removeBtn.addEventListener('click', () => {
                cardClone.remove();
                showData();
            });
        });
    });


    function showData() {
        const cardsCart = cartWrapper.querySelectorAll('.card');
        const cardsPrice = cartWrapper.querySelectorAll('.card-price');
        const cardTotal = document.querySelector('.cart-total span');
        let sum = 0;

        countGoods.textContent = cardsCart.length;

        cardsPrice.forEach((elem) => {
            let price = parseFloat(elem.textContent);
            sum += price;
        });
        cardTotal.textContent = sum;

        if (cardsCart.length !== 0){
            cartEmpty.remove();
        } else {
            cartWrapper.appendChild(cartEmpty);
        }
    }
}

//фильтр акции
function actionPage() {
    const cards = document.querySelectorAll('.goods .card'),
        discountCheckbox = document.getElementById('discount-checkbox'),
        min = document.getElementById('min'),
        max = document.getElementById('max'),
        search = document.querySelector('.search-wrapper_input'),
        searchBtn = document.querySelector('.search-btn');

    //фильтр по цене и по чекбоксу
    discountCheckbox.addEventListener('click', filter);
    min.addEventListener('change', filter);
    max.addEventListener('change', filter);

    //фильтр по поиск
    searchBtn.addEventListener('click', () => {
        const searchText = new RegExp(search.value.trim(), 'i');
        cards.forEach((elem) => {
            const title = elem.querySelector('.card-title');
            if (!searchText.test(title.textContent)) {
                elem.parentNode.style.display = 'none';
            } else {
                elem.parentNode.style.display = '';
            }
        });
        search.value = '';
    });

}

function filter() {
    const cards = document.querySelectorAll('.goods .card'),
        discountCheckbox = document.getElementById('discount-checkbox'),
        min = document.getElementById('min'),
        max = document.getElementById('max'),
        activeLi = document.querySelector('.catalog-list li.active');

    cards.forEach( (elem) => {
        const cardPrice = elem.querySelector('.card-price');
        const price = parseFloat(cardPrice.textContent);
        const discount = elem.querySelector('.card-sale');

        elem.parentNode.style.display = '';

        if ((min.value && price < min.value) || (max.value && price > max.value)){
            elem.parentNode.style.display = 'none';
        } else if (discountCheckbox.checked && !discount){
            elem.parentNode.style.display = 'none';
        } else if (activeLi){
            if (elem.dataset.category !== activeLi.textContent){
                elem.parentNode.style.display = 'none';
            }
        }
    });
}

//Получение данных с сервера
function getData() {
    const goodsWrapper = document.querySelector('.goods');
    return fetch('./db/db.json')
        .then((response) => {
            if (response.ok){
                return  response.json();
            }else {
                throw new Error ('ошибка' + response.status);
            }
        })
        .then((data) => {
            return data;
        })
        .catch( err => {
            console.warn(err);
            goodsWrapper.innerHTML = `<div>Упс что-то пошло не так</div>`;
        });
}

//вывод карточки товара
function renderCards(data) {
    const goodsWrapper = document.querySelector('.goods');
    data.goods.forEach((elem) => {
        const card = document.createElement('div');
        card.className = 'col-12 col-md-6 col-lg-4 col-xl-3';
        card.innerHTML = `
            <div class="card" data-category="${elem.category}">
                ${elem.sale ? '<div class="card-sale">🔥Hot Sale🔥</div>' : ''}
                <div class="card-img-wrapper">
                    <span class="card-img-top"
                    style="background-image: url('${elem.img}')"></span>
                </div>
                <div class="card-body justify-content-between">
                    <div class="card-price" style="${elem.sale ? 'color: red' : ''}">${elem.price} ₽</div>
                    <h5 class="card-title">${elem.title}</h5>
                    <button class="btn btn-primary">В корзину</button>
                </div>
            </div>
       `;
        goodsWrapper.appendChild(card);
    });
}

function renderCatalog(){
    const cards = document.querySelectorAll('.goods .card');
    const catalogList = document.querySelector('.catalog-list');
    const catalogBtn = document.querySelector('.catalog-button');
    const catalogWrapper = document.querySelector('.catalog');
    const categories = new Set();

    cards.forEach((card) => {
        categories.add(card.dataset.category);
    });

    categories.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        catalogList.appendChild(li);
    });

    const  allLi = catalogList.querySelector('li');

    catalogBtn.addEventListener('click', (event) => {
        if (catalogWrapper.style.display) {
            catalogWrapper.style.display = '';
        } else {
            catalogWrapper.style.display = 'block';
        }

        if (event.target.tagName === 'LI'){
            cards.forEach((elem) => {
                if (elem.dataset.category === event.target.textContent){
                    elem.parentNode.style.display = '';
                } else {
                    elem.parentNode.style.display = 'none';
                }
            });
            allLi.forEach((elem) => {
                if (elem === event.target){
                    elem.classList.add('active');
                } else {
                    elem.classList.remove('active');
                }
            });
            filter();
        }
    });
}

getData().then((data) => {
    renderCards(data);
    toggleCheckbox();
    toggleCart();
    addCart();
    actionPage();
    renderCatalog();
});