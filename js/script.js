const shop = document.querySelector(".shop");

let cart = [];
let buttonDOM = [];

class Product{
    async showProduct(){
        try {
            const response = await fetch("data.json");
            const product = await response.json();
            return product;
        } catch (error) {
            console.log(error)
        }
    }
}

class UI{
    displayProduct(product){
        const productUi = document.querySelector(".products");
        let display = product.map((item) => {
            const { id, title, price, image_url } = item;
            return `
            <div class="single-product">
                <div class="product-image">
                <img src="${image_url}" alt="image">
                </div>
                <h3>${title}</h3>
                <p>$${price}</p>
                <button class="btn" data-id =${id}>Add Item</button>
            </div>
        `
        });
        productUi.innerHTML = (display.join(""));
    }
    getBtn(){
        const btns = [...document.querySelectorAll(".btn")];
        buttonDOM = btns;
        btns.forEach((btn) => {
            let id = Number(btn.dataset.id);
            let matchId = cart.find((item) => item.id === id);
            if(matchId){
                btn.innerText = "Item Added",
                btn.disabled = true;
                btn.style.backgroundColor = "gray"
            }
            btn.addEventListener("click", ({target}) => {
                target.innerText = "Item Added",
                target.disabled = true;
                target.style.backgroundColor = "gray"
                //get product from localStorage
                let displayItems = {...Storage.getProducts(id), amount : 1};
                // push them to the cart.
                cart = [...cart, displayItems];
                //save the cart to localStorage
                Storage.saveCart(cart);
                // display the cart in shopping list
                this.displayCart(displayItems);
                // get the total price and amount 
                this.getTotal(cart);
            })
        })
    }
    //Method for adding the cart items to localStorage;
    setupAPP(){
        cart = Storage.cartToStorage();
        this.getTotal(cart);
        this.getPopulated(cart);
    }
    //Add the cart itself to localStorage;
    getPopulated(cart){
        cart.forEach((item) => this.displayCart(item));
    }
    displayCart(item){
        const div = document.createElement("div");
        div.innerHTML = `
        <div class="single-shop">
        <div class="shop-img">
        <img src="${item.image_url}" alt="image">
        <h4>${item.title}</h4>
        </div>
        <p>$${item.price}</p>
        <button class="remove" data-id="${item.id}">Remove</button>
        </div>
        `
        shop.appendChild(div);
    }
    getTotal(cart){
        let totalPrice = 0;
        let totalItem = 0;
        cart.map((item) => totalItem += item.amount)
        totalPrice = cart.reduce((acc, item) => acc + Number(item.price), 0)
        document.querySelector(".total-price").innerText = totalPrice;
        document.querySelector(".total-item").innerText = totalItem;
    }
    cartLogic(){
        // all remove buttons.
        const clearCart = document.querySelector(".clear-all");
        clearCart.addEventListener("click", () => {
            this.removeAll();
        });
        shop.addEventListener("click", ({target}) => {
            if(target.classList.contains("remove")){
                let getId = Number(target.dataset.id);
                shop.removeChild(target.parentElement.parentElement);
                this.remove(getId)
            }
        })
    }
    removeAll(){
        let cartId = cart.map((item) => item.id);
        cartId.forEach((id) => this.remove(id));
        while(shop.children.length > 0 ){
            shop.removeChild(shop.children[0])
        }
    }
    remove(id){
        cart = cart.filter((item) => item.id !== id);
        this.getTotal(cart);
        Storage.saveCart(cart);
        let button = this.getSingleBtn(id);
        button.disabled = false;
        button.innerText = "Add Item"
        button.style.backgroundColor = "blue"
    }
    getSingleBtn(id){
        return buttonDOM.find((btn) => Number(btn.dataset.id) === id);
    }
}

class Storage {
    static saveProduct(product){
        return localStorage.setItem("product", JSON.stringify(product));
    }
    static getProducts(id){
        let products = JSON.parse(localStorage.getItem("product"));
        return products.find((item) => item.id === id);
    }
    static saveCart(cart){
        return localStorage.setItem("cart", JSON.stringify(cart));
    }
    static cartToStorage(){
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
    }
}

window.addEventListener("DOMContentLoaded", () => {
    let product = new Product();
    let ui = new UI();
    // once the app is loaded.
    ui.setupAPP();

    product.showProduct().then((product) => {
        ui.displayProduct(product)
        Storage.saveProduct(product)
    }).then(() => {
        ui.getBtn();
        // for removing the items from cart
        ui.cartLogic();
    })
});
