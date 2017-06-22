import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
    
    // this line is the reason why the POST method doesn't work.
    e.preventDefault();


    console.log("Heart Itt!!!!");
    console.log(this); // this = heartForms, check 'heart.js'

    axios
        .post(this.action)
        .then(res => {
            const isHearted = this.heart.classList.toggle('heart__button--hearted');
            $('.heart-count').textContent = res.data.hearts.length;
            if (isHearted) {
                this.heart.classList.add('heart__buttton--float');
                setTimeout(() => {
                    this.heart.classList.remove('heart__buttton--float'), 2500
                });
            }
        })
        .catch(console.error);
}

export default ajaxHeart;