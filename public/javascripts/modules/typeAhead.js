const axios = require('axios'); //  "import axios from 'axios" also works
import dompurify from 'dompurify';

function searchResultHTML(stores) {
    return stores.map(store => {
        return `<a href="/store/${store.slug}" class="search__result"> 
            <strong>${store.name}</strong>
        </a>`
    }).join('');
};

function typeAhead(search) {
    if (!search) return;

    const searchInput = search.querySelector('input[name="search"]');
    const searchResults = search.querySelector('.search__results');

    searchInput.on('input', function() {
        // "this.value" is the input of search box.
        // console.log(`Input: ${this.value}`);
        if (!this.value) {
            searchResults.style.display = 'none';
            return;
        }

        // show the search results
        searchResults.style.display = 'block';
        searchResults.innerHTML = '';
        axios
            .get(`/api/v1/search?q=${this.value}`)
            .then(res => {
                if (res.data.length) {
                    // console.log(res.data);
                    searchResults.innerHTML = dompurify.sanitize(searchResultHTML(res.data));
                    return;
                }
                // return nothing come back
                searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value}</div>`);
            })
            .catch(err => {
                console.error(err);
            })
    });


    /**
     * =========================================================
     * handle keyboard inputs,
     * focus on selected "store.name" by arrow key "up" and "down".
     * But, the following codes are not working on my laptop.
     * =========================================================
     */
    // handle keyboard inputs
    searchInput.on('keyup', function(e) {
        // Don't care if key are not pressing up, down or enter.
        // ref http://keycode.info/
        var keyUp = 38, 
            keyDown = 40, 
            keyEnter = 13;
        if (![keyUp, keyDown, keyEnter].includes(e.keyCode)) {
            return;
        }
        // console.log('Do Somthing');
        /**
         * focus on selected "store.name" by arrow key "up" and "down", 
         * its a little complicate...
         */  
        const activeClass = 'search_result--active';
        const current = search.querySelector(`.${activeClass}`);
        const items = search.querySelectorAll('.search__result');
        let next;
        if (e.keyCode === keyDown && current) {
            next = current.nextElementSibling || items[0];
        } else if (e.keyCode === keyDown) {
            next = items[0];
        } else if (e.keyCode === keyUp && current) {
            next = current.previousElementSibling || items[items.length - 1];
        } else if (e.keyCode === keyUp) {
            next = items[items.length - 1];
        } else if (e.keyCode === keyEnter && current.href) {
            console.log('Changing Pages !');
            console.log(current);
            window.location = current.href;
            return;
        }

        if (current) {
            current.classList.remove(activeClass);
        }
        next.classList.add(activeClass);
    });
}

export default typeAhead;